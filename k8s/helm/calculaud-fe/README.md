# Calculaud Frontend Helm Chart

This Helm chart deploys the Calculaud frontend application to Kubernetes, with support for both EKS (AWS) and OpenShift platforms.

## Overview

The chart creates a complete deployment of the Calculaud frontend with:
- Nginx-based static file serving
- Runtime environment variable injection
- ALB integration for EKS
- Route support for OpenShift  
- Horizontal pod autoscaling
- Comprehensive health checks
- Security best practices

## Quick Start

### Prerequisites

- Kubernetes cluster (EKS or OpenShift)
- Helm 3.x installed
- kubectl configured for your cluster
- AWS CLI configured (for EKS deployments)

### Basic Deployment

```bash
# Deploy to staging
helm upgrade --install calculaud-fe-staging ./k8s/helm/calculaud-fe \
  --namespace calculaud \
  --create-namespace \
  --set platform=eks \
  --set environment.name=staging \
  --set ingress.hosts[0].host=calculaud-staging.example.com \
  --set runtime.apiBaseUrl=https://api-staging.example.com/api/v1 \
  --set runtime.authAuthority=https://auth.example.com \
  --set runtime.authClientId=calculaud-ui
```

### Production Deployment

```bash
# Deploy to production
helm upgrade --install calculaud-fe-production ./k8s/helm/calculaud-fe \
  --namespace calculaud \
  --create-namespace \
  --values ./k8s/helm/calculaud-fe/values-production.yaml \
  --set ingress.hosts[0].host=calculaud.example.com \
  --set runtime.apiBaseUrl=https://api.example.com/api/v1 \
  --set runtime.authAuthority=https://auth.example.com \
  --set runtime.authClientId=calculaud-ui
```

## Configuration

### Platform Support

Set the platform to enable the correct ingress/routing:

```yaml
# For AWS EKS with ALB
platform: "eks"

# For Red Hat OpenShift
platform: "openshift"
```

### ALB Integration (EKS)

The chart supports AWS Application Load Balancer with:
- Shared ALB groups across multiple services
- Path-based routing
- Health checks
- SSL termination support

```yaml
ingress:
  enabled: true
  className: "alb"
  groupName: "calculaud"  # Shared with backend
  groupOrder: 10         # Frontend gets priority
  annotations:
    alb.ingress.kubernetes.io/scheme: internal
    alb.ingress.kubernetes.io/target-type: ip
```

### Runtime Configuration

The frontend supports runtime environment variable injection:

```yaml
runtime:
  apiBaseUrl: "https://api.example.com/api/v1"
  authAuthority: "https://auth.example.com"
  authClientId: "calculaud-ui"
  authRedirectUri: "/"
  authScope: "openid"
```

### Resource Management

Production-ready resource settings:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

## Environment-Specific Values

### Staging Environment

Use `values-staging.yaml` for staging deployments with:
- Moderate resource allocation
- 2-5 replica scaling
- Faster health checks

### Production Environment

Use `values-production.yaml` for production deployments with:
- High resource allocation
- 3-10 replica scaling
- Conservative health checks
- Enhanced monitoring

## Security Features

- Non-root container execution
- Read-only root filesystem
- Dropped capabilities
- Security context constraints (OpenShift compatible)
- Service account with minimal permissions

## Monitoring and Health Checks

The chart includes comprehensive health checks:
- **Startup probes**: Initial application readiness
- **Liveness probes**: Container health monitoring  
- **Readiness probes**: Traffic routing decisions

## CI/CD Integration

The GitHub Actions workflows automatically deploy:
- **Staging**: On every main branch push
- **Production**: On release tag creation (requires manual approval)

Required secrets and variables:
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `EKS_CLUSTER_NAME`, `AWS_REGION`
- `STAGING_HOST`, `PRODUCTION_HOST`
- `STAGING_AUTH_AUTHORITY`, `PRODUCTION_AUTH_AUTHORITY`
- `STAGING_AUTH_CLIENT_ID`, `PRODUCTION_AUTH_CLIENT_ID`

## Troubleshooting

### Check pod status
```bash
kubectl get pods -n calculaud -l app.kubernetes.io/name=calculaud-fe
```

### View logs
```bash
kubectl logs -n calculaud deployment/calculaud-fe-staging
```

### Check ingress
```bash
kubectl get ingress -n calculaud
kubectl describe ingress calculaud-fe-staging -n calculaud
```

### Debug runtime variables
```bash
kubectl exec -n calculaud deployment/calculaud-fe-staging -- env | grep RUNTIME_
```

## Architecture

The deployment creates:
- **Deployment**: Frontend application pods
- **Service**: Internal service exposure
- **Ingress** (EKS): ALB integration with path-based routing
- **Route** (OpenShift): External access configuration
- **ConfigMap**: Non-sensitive application configuration
- **Secret**: Sensitive authentication configuration
- **ServiceAccount**: RBAC and security context
- **HorizontalPodAutoscaler**: Automatic scaling based on metrics

This setup provides a production-ready, scalable deployment that integrates seamlessly with the existing backend infrastructure.