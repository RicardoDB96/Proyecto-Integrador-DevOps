provider "aws" {
  region = "us-east-1"
}

# Crear una VPC
resource "aws_vpc" "main" {
  cidr_block = "10.10.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
}

# Crear una Subnet 1 en la zona de disponibilidad us-east-1a
resource "aws_subnet" "subnet_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.10.0.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
}

# Crear una Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

# Crear una tabla de rutas para la subred pública
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
}

# Crear una ruta que envíe el tráfico a la Internet Gateway
resource "aws_route" "internet_access" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

# Asociar la tabla de rutas con la subred pública
resource "aws_route_table_association" "subnet_1_association" {
  subnet_id      = aws_subnet.subnet_1.id
  route_table_id = aws_route_table.public.id
}

# Crear un Security Group básico para SSH y tráfico HTTP
resource "aws_security_group" "general_sec_group" {
  name        = "general_security_group"
  description = "Allow SSH and HTTP traffic"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Crear un par de llaves SSH para acceder a la infraestructura
resource "aws_key_pair" "default" {
  key_name   = "my-key-pair"
  public_key = file("${path.module}/id_rsa.pub") # Ruta relativa dentro de la carpeta del módulo de Terraform
}

# Crear una instancia EC2 de ejemplo
resource "aws_instance" "example" {
  ami           = "ami-084568db4383264d4"  # Reemplaza con una imagen AMI válida para tu región
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.subnet_1.id
  key_name      = aws_key_pair.default.key_name
  vpc_security_group_ids = [aws_security_group.general_sec_group.id]

  tags = {
    Name = "ExampleInstance"
  }
}

# Crear un Bucket S3 como ejemplo de almacenamiento
resource "aws_s3_bucket" "example_bucket" {
  bucket = "my-reservo-project-bucket-4499796"  # Asegúrate de que el nombre sea único
  acl    = "private"
}

# Salidas
output "vpc_id" {
  value = aws_vpc.main.id
}

output "subnet_ids" {
  value = [aws_subnet.subnet_1.id]
}

output "instance_public_ip" {
  value = aws_instance.example.public_ip
}

output "s3_bucket_name" {
  value = aws_s3_bucket.example_bucket.bucket
}
