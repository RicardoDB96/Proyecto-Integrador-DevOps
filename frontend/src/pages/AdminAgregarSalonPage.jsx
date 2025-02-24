import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminAgregarSalonPage() {
  const [form, setForm] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    precio: '',
    descripcion: '',
    contacto: '',
  });
  const [imagenes, setImagenes] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (!token || usuario?.rol !== "admin") {
      alert("Acceso denegado. Debes ser administrador.");
      navigate("/");
      return;
    }
  }, [token, usuario, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImagenChange = (e) => {
    setImagenes(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
      console.log(key, form[key]); // Verificar los valores del formulario
    });
  
    if (imagenes) {
      Array.from(imagenes).forEach((image, index) => {
        formData.append('imagenes', image);
        console.log('Imagen ' + index, image); // Verificar las imágenes
      });
    }
  
    try {
      const response = await api.post("/salones", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log('Respuesta:', response); // Verificar la respuesta del servidor
      alert("Salón agregado con éxito");
      navigate("/admin/reservas");
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      alert("Error al agregar el salón. Verifica los campos y vuelve a intentarlo.");
    }
  };
  
  

  return (
    <div>
      <h2>Agregar Salón</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre:
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>
          Ubicación:
          <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange} required />
        </label>
        <label>
          Capacidad:
          <input type="number" name="capacidad" value={form.capacidad} onChange={handleChange} required />
        </label>
        <label>
          Precio:
          <input type="number" name="precio" value={form.precio} onChange={handleChange} required />
        </label>
        <label>
          Descripción:
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required />
        </label>
        <label>
          Contacto:
          <input type="text" name="contacto" value={form.contacto} onChange={handleChange} required />
        </label>
        <label>
          Imágenes:
          <input type="file" name="imagenes" multiple onChange={handleImagenChange} />
        </label>
        <button type="submit">Agregar Salón</button>
      </form>
    </div>
  );
}

export default AdminAgregarSalonPage;
