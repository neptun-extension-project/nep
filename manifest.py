import json

with open("manifest.json") as f:
    manifest = json.load(f)

with open("server_data.json") as f:
    server_data = json.load(f)

server_urls = []
for servers in server_data:
    urls = [server["url"] for server in server_data[servers]]
    server_urls.extend(urls)

server_wildcards = [url + "*" for url in server_urls]
manifest["content_scripts"][0]["matches"] = server_wildcards
manifest["web_accessible_resources"][0]["matches"] = server_wildcards
manifest["host_permissions"] = server_wildcards

with open("manifest.json", "w") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
