# Configurar el proveedor de Google Cloud
provider "google" {
  project = var.project_id
  region  = var.region
}

# Crear un clúster de Kubernetes en GKE
resource "google_container_cluster" "reservocluster" {
  name     = "reservocluster"
  location = var.region
  initial_node_count = 2

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 20
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

# Obtener credenciales del clúster para kubectl
resource "null_resource" "get_credentials" {
  provisioner "local-exec" {
    command = "gcloud container clusters get-credentials reservocluster --region ${var.region} --project ${var.project_id}"
  }
}
