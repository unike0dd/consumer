# Consumer account activation

The Consumer dashboard requires both Firebase Authentication and trusted custom claims.

## One-time Google Cloud permission

Grant only the Consumer GitHub service account permission to read and update Firebase Authentication users:

```bash
gcloud projects add-iam-policy-binding gabo-service \
  --member="serviceAccount:github-consumer-dev@gabo-service.iam.gserviceaccount.com" \
  --role="roles/firebaseauth.admin"
```

The repository already authenticates to this service account through Workload Identity Federation. Do not create or download a service-account key.

## Activate one account

1. Verify the user's email in Firebase Authentication.
2. Copy the exact Firebase UID and email.
3. Open **Actions → Provision Consumer account → Run workflow**.
4. Enter the exact UID and email.
5. Run the workflow.
6. Sign out and sign back in through:
   `https://unike0dd.github.io/duplicate-hrservices/auth.html?dashboard=consumer&mode=signin`

The workflow fails closed when the UID is malformed, the email does not match, the email is unverified, or the account is disabled. It preserves unrelated existing custom claims and sets:

```json
{
  "account_type": "consumer",
  "account_status": "active"
}
```

## Security boundary

Custom claims are never assigned by browser code. Only the manually invoked GitHub workflow can request the change, using a short-lived Google Cloud credential and the exact Firebase UID.
