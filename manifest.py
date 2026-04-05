import json
from urllib.parse import urlparse

with open("manifest.json") as f:
    manifest = json.load(f)

with open("server_data.json") as f:
    server_data = json.load(f)

server_urls = []
content_scripts = []
web_accessible_resources = []
host_permissions = []

for servers in server_data:
    urls = [server["url"] for server in server_data[servers]]
    server_urls.extend(urls)

for url in server_urls:
    host_permissions.append(url+"*")
    web_accessible_resources.append('/'.join(url.split("/")[:3]) + '/*')
    parsed_url = urlparse(url)
    content_scripts.append(url + '*')
    if parsed_url.path == '/':
        content_scripts.append(url)
    else:
        content_scripts.append(url.strip('/'))

manifest["content_scripts"][0]["matches"] = content_scripts
manifest["content_scripts"][1]["matches"] = content_scripts
manifest["web_accessible_resources"][0]["matches"] = web_accessible_resources
manifest["host_permissions"] = host_permissions

with open("manifest.json", "w") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
