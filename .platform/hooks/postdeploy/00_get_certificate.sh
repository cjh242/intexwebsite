
#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d wellnessprovo.is404.net  --nginx --agree-tos --email cjh242@byu.edu