export const environment = {
  production: false,
  apiBase: 'https://ash-meters-genealogy-exports.trycloudflare.com', // dominio base

  endpoints: {
    // SmartMenuX
    users: '/smartMenux/api/users',
    roles: '/smartMenux/api/roles',
    pedidos: '/smartMenux/api/pedidos',
    platillos: '/smartMenux/api/platillos',
    inventarioCrud: '/smartMenux/api/inventario',
    clientesCrud: '/smartMenux/api/clientes',

    // PruebaRest (los GET “legacy” que ya usas)
    inventarioGetAll: '/smartMenux/api/inventario',
    clientesGetAll: '/smartMenux/api/clientes',
      proveedoresGetAll: '/smartMenux/api/proveedores',

  },
};
