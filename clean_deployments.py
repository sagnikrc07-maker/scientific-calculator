#!/usr/bin/env python3
"""
clean_deployments.py
Prunes non-production deployments on GitHub for sagnikrc07-maker/scientific-calculator.
Keeps the production deployment intact.
"""

import sys
import os
import json
import argparse
import urllib.request
import urllib.error

DEFAULT_REPO = "sagnikrc07-maker/scientific-calculator"
API_BASE = "https://api.github.com"

def make_request(url, token, method="GET", data=None):
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Deployments-Pruner-Script"
    }
    encoded_data = None
    if data is not None:
        encoded_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 204:
                return {}
            content = response.read().decode("utf-8")
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} Error: {e.reason}\nDetails: {err_body}")

def get_deployments(repo, token):
    url = f"{API_BASE}/repos/{repo}/deployments?per_page=100"
    return make_request(url, token, method="GET")

def deactivate_deployment(repo, deployment_id, token):
    url = f"{API_BASE}/repos/{repo}/deployments/{deployment_id}/statuses"
    return make_request(url, token, method="POST", data={"state": "inactive"})

def delete_deployment(repo, deployment_id, token):
    url = f"{API_BASE}/repos/{repo}/deployments/{deployment_id}"
    return make_request(url, token, method="DELETE")

def is_production(dep):
    if dep.get("production_environment") is True:
        return True
    env_name = str(dep.get("environment", "")).strip().lower()
    return env_name in ["production", "prod"]

def main():
    parser = argparse.ArgumentParser(description="Clean up previous deployments, keeping only the latest production deployment.")
    parser.add_argument("--repo", default=DEFAULT_REPO, help=f"GitHub repository in 'owner/repo' format (default: {DEFAULT_REPO})")
    parser.add_argument("--token", default=os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN"), help="GitHub Personal Access Token (or set GITHUB_TOKEN env var)")
    parser.add_argument("--dry-run", action="store_true", help="List deployments and what would be deleted without making any changes")
    parser.add_argument("--list-only", action="store_true", help="Only list deployments without deleting")
    args = parser.parse_args()

    token = args.token
    if not token:
        print("[-] Error: No GitHub Personal Access Token provided.")
        print("    Usage: python clean_deployments.py --token <YOUR_GITHUB_TOKEN>")
        print("    Or set the environment variable GITHUB_TOKEN.")
        sys.exit(1)

    print(f"[*] Fetching deployments for {args.repo}...")
    try:
        deployments = get_deployments(args.repo, token)
    except Exception as e:
        print(f"[-] Failed to fetch deployments: {e}")
        sys.exit(1)

    if not deployments:
        print("[+] No deployments found in repository.")
        return

    # Sort descending by creation date (newest first)
    deployments.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    print(f"[+] Found {len(deployments)} deployment(s):")
    to_delete = []
    to_keep = []
    found_latest_prod = False

    for d in deployments:
        dep_id = d.get("id")
        env = d.get("environment", "unknown")
        created = d.get("created_at", "unknown")
        sha = d.get("sha", "")[:7]
        prod_flag = is_production(d)

        if prod_flag and not found_latest_prod:
            found_latest_prod = True
            to_keep.append(d)
            print(f"  - [KEEP - CURRENT PRODUCTION] ID: {dep_id} | Env: {env} | SHA: {sha} | Created: {created}")
        else:
            to_delete.append(d)
            print(f"  - [TARGET FOR DELETION - PREVIOUS] ID: {dep_id} | Env: {env} | SHA: {sha} | Created: {created}")

    if args.list_only:
        print("\n[+] Done listing.")
        return

    if not to_delete:
        print("\n[+] No previous deployments found to delete.")
        return

    if args.dry_run:
        print(f"\n[DRY RUN] Would delete {len(to_delete)} previous deployment(s). Preserving 1 current production deployment.")
        return

    print(f"\n[*] Deleting {len(to_delete)} previous deployment(s)...")
    success_count = 0

    for d in to_delete:
        dep_id = d.get("id")
        env = d.get("environment", "unknown")
        print(f"  [*] Processing deployment {dep_id} ({env})...")
        try:
            # Step 1: Inactivate
            deactivate_deployment(args.repo, dep_id, token)
            # Step 2: Delete
            delete_deployment(args.repo, dep_id, token)
            print(f"    [+] Successfully deleted deployment {dep_id}")
            success_count += 1
        except Exception as e:
            print(f"    [-] Failed to delete deployment {dep_id}: {e}")

    print(f"\n[+] Completed. Successfully deleted {success_count}/{len(to_delete)} previous deployments.")
    print(f"[+] Preserved {len(to_keep)} current production deployment.")

if __name__ == "__main__":
    main()
