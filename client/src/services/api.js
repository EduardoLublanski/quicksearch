
const baseUrl = "http://localhost:8080/api/v1/quicksearch";

export const createApiService = (authAxios) => {
  return {
    listClientes: async () => {
      const res = await authAxios.get(`${baseUrl}/cliente`);
      return { data: res.data };
    },

    registerCliente: async (cliente) => {
      const res = await authAxios.post(`${baseUrl}/cliente`, cliente);
      return { data: res.data };
    },

    updateCliente: async (cliente) => {
      const res = await authAxios.put(`${baseUrl}/cliente`, cliente);
      return { data: res.data };
    },

    deleteClienteByCpf: async (clienteCpf) => {
      const res = await authAxios.delete(`${baseUrl}/cliente/${clienteCpf}`);
      return { data: res.data };
    },

    listAdvogados: async () => {
      const res = await authAxios.get(`${baseUrl}/advogado`);
      return { data: res.data };
    },

    getAdvogadoByOAB: async (oabCode) => {
      const res = await authAxios.get(`${baseUrl}/advogado/${oabCode}`);
      return { data: res.data };
    },

    registerAdvogado: async (advogado) => {
      const res = await authAxios.post(`${baseUrl}/advogado`, advogado);
      return { data: res.data };
    },

    updateAdvogado: async (advogado) => {
      const res = await authAxios.put(`${baseUrl}/advogado`, advogado);
      return { data: res.data };
    },

    deleteAdvogadoByOAB: async (advogadoOAB) => {
      const res = await authAxios.delete(`${baseUrl}/advogado/${advogadoOAB}`);
      return { data: res.data };
    },

    listProcessos: async () => {
      const res = await authAxios.get(`${baseUrl}/cliente/processo`);
      return { data: res.data };
    },

    registerProcesso: async (processo) => {
      const res = await authAxios.post(`${baseUrl}/cliente/processo`, processo);
      return { data: res.data };
    },

    updateProcesso: async (processoId, updatedProcesso) => {
      const res = await authAxios.patch(`${baseUrl}/cliente/processo/${processoId}`, updatedProcesso);
      return { data: res.data };
    },

    deleteProcessoById: async (processoId) => {
      const res = await authAxios.delete(`${baseUrl}/cliente/processo/${processoId}`);
      return { data: res.data };
    },

    addDocumentoByProcessoId: async (processoId, documento) => {
      const res = await authAxios.patch(`${baseUrl}/cliente/processo/${processoId}/documento`, documento);
      return { data: res.data };
    },

    addPrazoByProcessoId: async (processoId, prazo) => {
      const res = await authAxios.patch(`${baseUrl}/cliente/processo/${processoId}/prazo`, prazo);
      return { data: res.data };
    },

    listDocumentos: async (processoId) => {
      const res = await authAxios.get(`${baseUrl}/cliente/processo/${processoId}/documento`);
      return { data: res.data };
    },

    listPrazos: async (processoId) => {
      const res = await authAxios.get(`${baseUrl}/cliente/processo/${processoId}/prazo`);
      return { data: res.data };
    },

    deleteDocumento: async (processoId, documentoId) => {
      const res = await authAxios.delete(`${baseUrl}/cliente/processo/${processoId}/documento/${documentoId}`);
      return { data: res.data };
    },

    deletePrazo: async (processoId, prazoId) => {
      const res = await authAxios.delete(`${baseUrl}/cliente/processo/${processoId}/prazo/${prazoId}`);
      return { data: res.data };
    },
    listUsuario: async () => {
      const res = await authAxios.get(`${baseUrl}/usuario`);
      return { data: res.data };
    },

    registerUsuario: async (usuario) => {
      const res = await authAxios.post(`${baseUrl}/usuario`, usuario);
      return { data: res.data };
    },

    updateUsuario: async (usuario) => {
      const res = await authAxios.put(`${baseUrl}/usuario`, usuario);
      return { data: res.data };
    },
    updateUsuarioRole: async (usuarioId, newRole) => {
      const res = await authAxios.patch(`${baseUrl}/usuario/${usuarioId}`, newRole);
      return { data: res.data };
    },

    deleteUsuarioById: async (usuarioId) => {
      const res = await authAxios.delete(`${baseUrl}/usuario/${usuarioId}`);
      return { data: res.data };
    },
  };
};

