## 🚀 What's New in v[VERSION]

### 🎯 New Features
- 

### 🐛 Bug Fixes
- 

### 🔧 Improvements
- 

### 📚 Documentation
- 

### 🛠️ Technical Changes
- 

### 🔒 Security Updates
- 

### ⚠️ Breaking Changes
- 

### 🗑️ Deprecated Features
- 

---

## 📦 Installation & Deployment

### Docker
```bash
# Pull the latest release
docker pull username/calculaud-fe:v[VERSION]

# Run the container
docker run -p 8080:8080 username/calculaud-fe:v[VERSION]
```

### Runtime Environment Variables
```bash
docker run -p 8080:8080 \
  -e RUNTIME_API_BASE_URL=https://your-api-endpoint.com/api/v1 \
  -e RUNTIME_AUTH_AUTHORITY=https://adfs.contoso.com/adfs \
  -e RUNTIME_AUTH_CLIENT_ID=your-client-id \
  -e RUNTIME_AUTH_REDIRECT_URI=http://localhost:8080/ \
  -e RUNTIME_AUTH_RESPONSE_TYPE=code \
  -e RUNTIME_AUTH_RESPONSE_MODE=query \
  -e RUNTIME_AUTH_SCOPE=openid \
  username/calculaud-fe:v[VERSION]
```

## 🏗️ Build Information

**Platforms Supported:**
- linux/amd64

**Docker Images:**
- `username/calculaud-fe:v[VERSION]`
- `username/calculaud-fe:[VERSION]`
- `username/calculaud-fe:latest`

## 🔗 Links

- [Full Changelog](https://github.com/calc-cloud/calculaud-fe/compare/v[PREVIOUS_VERSION]...v[VERSION])
- [Documentation](https://github.com/calc-cloud/calculaud-fe/blob/main/README.md)
- [Issues](https://github.com/calc-cloud/calculaud-fe/issues)

## 👥 Contributors

Thanks to all contributors who made this release possible!

## 🐛 Known Issues

- 

## 🔮 What's Next

- 

---

**Full Changelog**: https://github.com/calc-cloud/calculaud-fe/compare/v[PREVIOUS_VERSION]...v[VERSION]