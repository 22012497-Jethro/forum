from supabase import create_client, Client

# Replace these with your Supabase URL and API Key
url: str = "https://fudsrzbhqpmryvmxgced.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag"

# Create a Supabase client
supabase: Client = create_client(url, key)

try:
    # Example: Fetching data from a table
    response = supabase.table('users').select('*').execute()
    if response.error:
        print("Error fetching data:", response.error)
    else:
        print(response.data)
except Exception as e:
    print("An error occurred:", e)
