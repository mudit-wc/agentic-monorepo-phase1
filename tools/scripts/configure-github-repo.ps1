# One-off repo configuration for mudit-wc/agentic-monorepo-phase1 (AB#21). Idempotent; safe to re-run.
$ErrorActionPreference = 'Stop'
$repo = 'mudit-wc/agentic-monorepo-phase1'

Write-Output '== General: squash-only, auto-delete branches, security & analysis =='
@'
{
  "allow_squash_merge": true,
  "allow_merge_commit": false,
  "allow_rebase_merge": false,
  "delete_branch_on_merge": true,
  "squash_merge_commit_title": "PR_TITLE",
  "squash_merge_commit_message": "PR_BODY",
  "has_wiki": false,
  "has_projects": false,
  "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" },
    "dependabot_security_updates": { "status": "enabled" }
  }
}
'@ | gh api -X PATCH "repos/$repo" --input - --jq '{squash:.allow_squash_merge, merge:.allow_merge_commit, rebase:.allow_rebase_merge, autodelete:.delete_branch_on_merge, sec:.security_and_analysis}'

Write-Output '== Dependabot alerts + automated security fixes =='
gh api -X PUT "repos/$repo/vulnerability-alerts" | Out-Null; Write-Output 'vulnerability-alerts: enabled'
gh api -X PUT "repos/$repo/automated-security-fixes" | Out-Null; Write-Output 'automated-security-fixes: enabled'

Write-Output '== Actions permissions =='
'{"enabled":true,"allowed_actions":"selected"}' | gh api -X PUT "repos/$repo/actions/permissions" --input - | Out-Null
'{"github_owned_allowed":true,"verified_allowed":true,"patterns_allowed":["nrwl/nx-set-shas@*","anchore/sbom-action@*"]}' | gh api -X PUT "repos/$repo/actions/permissions/selected-actions" --input - | Out-Null
'{"default_workflow_permissions":"read","can_approve_pull_request_reviews":true}' | gh api -X PUT "repos/$repo/actions/permissions/workflow" --input - | Out-Null
gh api "repos/$repo/actions/permissions/selected-actions"
gh api "repos/$repo/actions/permissions/workflow"

Write-Output '== Labels =='
foreach ($l in @(
  @{ name = 'agent-task'; color = '7057ff'; description = 'Suitable for the Copilot coding agent' },
  @{ name = 'dependencies'; color = '0366d6'; description = 'Dependency updates (Dependabot)' },
  @{ name = 'ci'; color = 'e4e669'; description = 'CI / workflow changes' }
)) {
  gh label create $l.name --color $l.color --description $l.description --force | Out-Null
  Write-Output "label: $($l.name)"
}

Write-Output '== Ruleset: protect main =='
# PowerShell 5.1 strips inner double quotes when passing to native exes; escape them for jq
$existing = gh api "repos/$repo/rulesets" --jq ".[] | select(.name==\`"protect-main\`") | .id"
$ruleset = @'
{
  "name": "protect-main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [
    { "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "pull_request" }
  ],
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "allowed_merge_methods": ["squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          { "context": "Lint · Test · Build (affected)" },
          { "context": "E2E (affected)" },
          { "context": "PR hygiene" },
          { "context": "Analyze (javascript-typescript)" },
          { "context": "Dependency review" }
        ]
      }
    }
  ]
}
'@
if ($existing) {
  $ruleset | gh api -X PUT "repos/$repo/rulesets/$existing" --input - --jq '{id,name,enforcement,rules:[.rules[].type]}'
} else {
  $ruleset | gh api -X POST "repos/$repo/rulesets" --input - --jq '{id,name,enforcement,rules:[.rules[].type]}'
}
