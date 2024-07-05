from supabase import create_client, Client

# Replace these with your Supabase URL and API Key
url: str = "https://fudsrzbhqpmryvmxgced.supabase.co/rest/v1/"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag"

# Create a Supabase client
supabase: Client = create_client(url, key)

# Example: Fetching data from a table
response = supabase.table('users').select('*').execute()
print(response.data)