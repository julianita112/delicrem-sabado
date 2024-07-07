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

export function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState({
    nombre: "",
    stock_actual: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [insumosPerPage] = useState(6);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInsumos();
  }, []);

  const fetchInsumos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/insumos");
      setInsumos(response.data);
      setFilteredInsumos(response.data);
    } catch (error) {
      console.error("Error fetching insumos:", error);
    }
  };

  useEffect(() => {
    filterInsumos();
  }, [search, insumos]);

  const filterInsumos = () => {
    const filtered = insumos.filter((insumo) =>
      insumo.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredInsumos(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (insumo) => {
    setSelectedInsumo(insumo);
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedInsumo({
      nombre: "",
      stock_actual: 0,
    });
    setEditMode(false);
    handleOpen();
  };

  const handleDelete = async (insumo) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el insumo ${insumo.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/insumos/${insumo.id_insumo}`);
        fetchInsumos(); // Refrescar la lista de insumos
        Swal.fire('¡Eliminado!', 'El insumo ha sido eliminado.', 'success');
      } catch (error) {
        console.error("Error deleting insumo:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar el insumo.', 'error');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/insumos/${selectedInsumo.id_insumo}`, selectedInsumo);
      } else {
        await axios.post("http://localhost:3000/api/insumos", selectedInsumo);
      }
      fetchInsumos(); // Refrescar la lista de insumos
      handleOpen();
    } catch (error) {
      console.error("Error saving insumo:", error);
      Swal.fire('Error', 'Hubo un problema al guardar el insumo.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedInsumo({ ...selectedInsumo, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (insumo) => {
    setSelectedInsumo(insumo);
    handleDetailsOpen();
  };

  // Obtener insumos actuales
  const indexOfLastInsumo = currentPage * insumosPerPage;
  const indexOfFirstInsumo = indexOfLastInsumo - insumosPerPage;
  const currentInsumos = filteredInsumos.slice(indexOfFirstInsumo, indexOfLastInsumo);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="mb-6" color="green" startIcon={<PlusIcon />}>
            Crear Insumo
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
              Lista de Insumos
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentInsumos.map((insumo) => (
                <Card key={insumo.id_insumo} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    {insumo.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Stock Actual: {insumo.stock_actual}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton color="blue" onClick={() => handleEdit(insumo)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="red" onClick={() => handleDelete(insumo)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="blue-gray" onClick={() => handleViewDetails(insumo)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                insumosPerPage={insumosPerPage}
                totalInsumos={filteredInsumos.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>{editMode ? "Editar Insumo" : "Crear Insumo"}</DialogHeader>
        <DialogBody divider>
          <Input
            label="Nombre"
            name="nombre"
            value={selectedInsumo.nombre}
            onChange={handleChange}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" color="green" onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Insumo"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles del Insumo</DialogHeader>
        <DialogBody divider>
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="font-semibold">Nombre:</td>
                <td>{selectedInsumo.nombre}</td>
              </tr>
              <tr>
                <td className="font-semibold">Stock Actual:</td>
                <td>{selectedInsumo.stock_actual}</td>
              </tr>
              <tr>
                <td className="font-semibold">Creado:</td>
                <td>{selectedInsumo.createdAt ? new Date(selectedInsumo.createdAt).toLocaleString() : 'N/A'}</td>
              </tr>
              <tr>
                <td className="font-semibold">Actualizado:</td>
                <td>{selectedInsumo.updatedAt ? new Date(selectedInsumo.updatedAt).toLocaleString() : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" color="blue-gray" onClick={handleDetailsOpen}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

// Componente de paginación
const Pagination = ({ insumosPerPage, totalInsumos, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalInsumos / insumosPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination flex space-x-2">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item">
            <Button
              onClick={() => paginate(number)}
              className="page-link"
            >
              {number}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Insumos;
