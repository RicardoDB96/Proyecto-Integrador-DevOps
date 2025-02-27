variable "project_id" {
  description = "ID del Proyecto en Google Cloud"
  type        = string
  default     = "reservo-452207"
}

variable "region" {
  description = "Región donde se desplegará el clúster"
  type        = string
  default     = "us-central1"  # Puedes cambiarlo si lo necesitas
}
