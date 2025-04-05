# variables.tf
variable "project_id" {
  description = "AWS-Reservo"
  type        = string
  default = "reservo"
}

variable "region" {
  description = "Región de AWS donde se desplegará el clúster"
  type        = string
  default     = "us-east-1"  # Puedes cambiar la región si lo deseas
}

variable "instance_type" {
  description = "Tipo de instancia para los nodos"
  type        = string
  default     = "t2.medium"
}
