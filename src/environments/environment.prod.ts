export const environment = {
  production: true,
  apiBase: 'https://ash-meters-genealogy-exports.trycloudflare.com', // 👈 cámbialo
  endpoints: {
    users: '/smartMenux/api/users',
    roles: '/smartMenux/api/roles',
    pedidos: '/smartMenux/api/pedidos',
    platillos: '/smartMenux/api/platillos',
    inventarioCrud: '/smartMenux/api/inventario',
    clientesCrud: '/smartMenux/api/clientes',
    inventarioGetAll: '/smartMenux/api/inventario',
    clientesGetAll: '/smartMenux/api/clientes',
    proveedoresGetAll: '/smartMenux/api/proveedores',

  },
};
