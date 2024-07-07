import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  IconButton,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState({
    nombre: "",
    contacto: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [proveedoresPerPage] = useState(3);
  const [search, setSearch] = useState("");
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    contacto: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/proveedores");
      setProveedores(response.data);
      setFilteredProveedores(response.data);
    } catch (error) {
      console.error("Error fetching proveedores:", error);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar proveedores'
      });
    }
  };

  useEffect(() => {
    filterProveedores();
  }, [search, proveedores]);

  const filterProveedores = () => {
    const filtered = proveedores.filter((proveedor) =>
      proveedor.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProveedores(filtered);
  };

  const handleOpen = () => {
    setOpen(!open);
    setFormErrors({
      nombre: '',
      contacto: ''
    });
  };

  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedProveedor({
      nombre: "",
      contacto: "",
    });
    setEditMode(false);
    handleOpen();
  };

  const handleDelete = async (proveedor) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar al proveedor ${proveedor.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/proveedores/${proveedor.id_proveedor}`);
        fetchProveedores(); // Refrescar la lista de proveedores
        Swal.fire('¡Eliminado!', 'El proveedor ha sido eliminado.', 'success');
      } catch (error) {
        console.error("Error deleting proveedor:", error);
        Swal.fire('Error', 'El proveedor no se puede eliminar ya que se encuentra asociado a una compra.', 'error');
      }
    }
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        if (editMode) {
          await axios.put(`http://localhost:3000/api/proveedores/${selectedProveedor.id_proveedor}`, selectedProveedor);
          Toast.fire({
            icon: 'success',
            title: 'Proveedor actualizado exitosamente'
          });
        } else {
          await axios.post("http://localhost:3000/api/proveedores", selectedProveedor);
          Toast.fire({
            icon: 'success',
            title: 'Proveedor creado exitosamente'
          });
        }
        fetchProveedores(); // Refrescar la lista de proveedores
        handleOpen();
      } catch (error) {
        console.error("Error saving proveedor:", error);
        Swal.fire('Error', 'Hubo un problema al guardar el proveedor.', 'error');
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {};

    if (!selectedProveedor.nombre.trim()) {
      errors.nombre = 'El nombre del proveedor es requerido';
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(selectedProveedor.nombre)) {
      errors.nombre = 'El nombre del proveedor solo puede contener letras y espacios';
      isValid = false;
    }

    if (!selectedProveedor.contacto.trim()) {
      errors.contacto = 'El contacto es requerido';
      isValid = false;
    } else if (!/^\d{7,}$/.test(selectedProveedor.contacto)) {
      errors.contacto = 'El contacto debe contener al menos 7 dígitos numéricos';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProveedor({ ...selectedProveedor, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (proveedor) => {
    setSelectedProveedor(proveedor);
    handleDetailsOpen();
  };

  // Obtener proveedores actuales
  const indexOfLastProveedor = currentPage * proveedoresPerPage;
  const indexOfFirstProveedor = indexOfLastProveedor - proveedoresPerPage;
  const currentProveedores = filteredProveedores.slice(indexOfFirstProveedor, indexOfLastProveedor);

  // Array de números de página
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProveedores.length / proveedoresPerPage); i++) {
    pageNumbers.push(i);
  }

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" color="green" startIcon={<PlusIcon />}>
            Crear Proveedor
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nombre"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Proveedores
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre del proveedor
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número de Contacto
                    </th>
                    <th scope="col" className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProveedores.map((proveedor) => (
                    <tr key={proveedor.id_proveedor}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div className="text-sm text-gray-900">{proveedor.nombre}</div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap ">
                        <div className="text-sm text-gray-900">{proveedor.contacto}</div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <IconButton className="btnedit" size="sm" onClick={() => handleEdit(proveedor)}>
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton className="cancelar" size="sm" onClick={() => handleDelete(proveedor)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton className="btnView" size="sm" onClick={() => handleViewDetails(proveedor)}>
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <ul className="flex justify-center">
                {pageNumbers.map((number) => (
                  <li
                    key={number}
                    onClick={() => paginate(number)}
                    className={`mx-1 px-3 py-1 bg-blue-600 text-white cursor-pointer rounded-md ${currentPage === number ? 'bg-blue-800' : ''}`}
                  >
                    {number}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal para crear/editar proveedor */}
      <Dialog open={open} onClose={handleOpen}>
        <DialogHeader>{editMode ? "Editar Proveedor" : "Crear Proveedor"}</DialogHeader>
        <DialogBody>
          <div className="flex flex-col space-y-3">
            <Input
              type="text"
              name="nombre"
              value={selectedProveedor.nombre}
              onChange={handleChange}
              label="Nombre del proveedor"
              required
              error={formErrors.nombre && formErrors.nombre.length > 0}
            />
            {formErrors.nombre && (
              <Typography color="red" className="text-sm">
                {formErrors.nombre}
              </Typography>
            )}
            <Input
              type="text"
              name="contacto"
              value={selectedProveedor.contacto}
              onChange={handleChange}
              label="Número de contacto"
              required
              error={formErrors.contacto && formErrors.contacto.length > 0}
            />
            {formErrors.contacto && (
              <Typography color="red" className="text-sm">
                {formErrors.contacto}
              </Typography>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleOpen} className="btncancelarm">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="btnagregar" color="green">
            Guardar
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modal para ver detalles del proveedor */}
      <Dialog open={detailsOpen} onClose={handleDetailsOpen} className="details-modal">
  <DialogHeader>Detalles del Proveedor</DialogHeader>
  <DialogBody>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-black">
        <thead className="bg-gradient-to-r from-pink-200 to-pink-500 text-white">
          <tr>
            <th className="p-2 border-b border-black">Campo</th>
            <th className="p-2 border-b border-black">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-b border-gray-200">Nombre</td>
            <td className="p-2 border-b border-gray-200">{selectedProveedor.nombre}</td>
          </tr>
          <tr>
            <td className="p-2 border-b border-gray-200">Contacto</td>
            <td className="p-2 border-b border-gray-200">{selectedProveedor.contacto}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DialogBody>
  <DialogFooter>
    <Button variant="text" className="cancelar" color="red" onClick={handleDetailsOpen}>
      Cerrar
    </Button>
  </DialogFooter>
</Dialog>

    </>
  );
}
