import React, { useState, useEffect } from "react";
import { Table, Modal, message, Badge, Button, Select, Space } from "antd";
import { FileTextOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import "dayjs/locale/pt-br";

import { useAuth } from "../../services/authContex.js";
import { createApiService } from "../../services/api.js";

dayjs.locale("pt-br");

const { Option } = Select;

const ProcessosPage = () => {
  const { codigoOAB } = useParams();
  const { authAxios } = useAuth();
  const quickSearchApi = createApiService(authAxios);

  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // === Modais ===
  const [modalDetalhes, setModalDetalhes] = useState({ visible: false, processo: null });
  const [documentosModal, setDocumentosModal] = useState({ visible: false, lista: [] });
  const [prazosModal, setPrazosModal] = useState({ visible: false, lista: [] });

  // === Filtros ===
  const [statusFilter, setStatusFilter] = useState(null);
  const [pendenciaFilter, setPendenciaFilter] = useState(false);

  const carregarProcessos = async () => {
    setLoading(true);
    try {
      const res = await quickSearchApi.listProcessos();
      if (res.data && Array.isArray(res.data)) {
        const lista = res.data.sort(
          (a, b) => new Date(b.data_abertura) - new Date(a.data_abertura)
        );
        setProcessos(lista);
      }
    } catch (error) {
      console.error(error);
      messageApi.error("Erro ao carregar processos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProcessos();
  }, [codigoOAB]);

  // === Modais de pendências ===
  const abrirDocumentos = async (processoId) => {
    try {
      const res = await quickSearchApi.listDocumentos(processoId);
      setDocumentosModal({ visible: true, lista: res.data || [] });
    } catch {
      messageApi.error("Erro ao carregar documentos.");
    }
  };

  const abrirPrazos = async (processoId) => {
    try {
      const res = await quickSearchApi.listPrazos(processoId);
      setPrazosModal({ visible: true, lista: res.data || [] });
    } catch {
      messageApi.error("Erro ao carregar prazos.");
    }
  };

  // === Filtro de dados ===
  const processosFiltrados = processos.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;

    if (pendenciaFilter) {
      const temDocumento = p.documentos_pendentes?.length > 0;
      const temPrazo = p.prazos_processuais?.length > 0;
      if (!temDocumento && !temPrazo) return false;
    }

    return true;
  });

  const columns = [
    { title: "Número", dataIndex: "numero", key: "numero" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Tipo", dataIndex: "tipo", key: "tipo" },
    { title: "Vara", dataIndex: "vara", key: "vara" },
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      render: (cliente) => cliente?.nome || "—",
    },
    {
      title: "Advogado",
      dataIndex: "advogado_responsavel",
      key: "advogado_responsavel",
      render: (advogado) => advogado?.nome || "—",
    },
    { title: "Localização", dataIndex: "localizacao", key: "localizacao" },
    {
      title: "Documentos",
      key: "documentos",
      render: (_, record) => (
        <Badge
          count={record.documentos_pendentes?.length || 0}
          showZero
          style={{ backgroundColor: "#faad14", cursor: "pointer" }}
          onClick={() => abrirDocumentos(record.id)}
        >
          <Button type="text" icon={<FileTextOutlined />} />
        </Badge>
      ),
    },
    {
      title: "Prazos",
      key: "prazos",
      render: (_, record) => (
        <Badge
          count={record.prazos_processuais?.length || 0}
          showZero
          style={{ backgroundColor: "#52c41a", cursor: "pointer" }}
          onClick={() => abrirPrazos(record.id)}
        >
          <Button type="text" icon={<ClockCircleOutlined />} />
        </Badge>
      ),
    },
    {
      title: "Valor da Causa",
      dataIndex: "valor_causa",
      key: "valor_causa",
      render: (v) => (v != null ? `R$ ${v.toLocaleString()}` : "—"),
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_, record) => (
        <a onClick={() => setModalDetalhes({ visible: true, processo: record })}>
          Ver Detalhes
        </a>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      <h2>Todos os Processos</h2>

      {/* === FILTROS === */}
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Filtrar por Status"
          allowClear
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 180 }}
        >
          <Option value="Ativo">Ativo</Option>
          <Option value="Suspenso">Suspenso</Option>
          <Option value="Arquivado">Arquivado</Option>
        </Select>

        <Select
          placeholder="Filtrar por Pendências"
          allowClear
          value={pendenciaFilter ? "comPendencias" : null}
          onChange={(value) => setPendenciaFilter(value === "comPendencias")}
          style={{ width: 180 }}
        >
          <Option value="comPendencias">Com pendências</Option>
        </Select>

        <Button onClick={() => { setStatusFilter(null); setPendenciaFilter(false); }}>
          Limpar Filtros
        </Button>
      </Space>

      {/* === TABELA === */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={processosFiltrados}
        loading={loading}
        bordered
      />

      {/* === MODAIS === */}
      <Modal
        title="Detalhes do Processo"
        open={modalDetalhes.visible}
        onCancel={() => setModalDetalhes({ visible: false, processo: null })}
        footer={null}
      >
        {modalDetalhes.processo && (
          <div>
            <p><b>Número:</b> {modalDetalhes.processo.numero}</p>
            <p><b>Status:</b> {modalDetalhes.processo.status}</p>
            <p><b>Tipo:</b> {modalDetalhes.processo.tipo}</p>
            <p><b>Vara:</b> {modalDetalhes.processo.vara}</p>
            <p><b>Descrição:</b> {modalDetalhes.processo.descricao}</p>
            <p><b>Localização:</b> {modalDetalhes.processo.localizacao}</p>
            <p><b>Cliente:</b> {modalDetalhes.processo.cliente?.nome}</p>
            <p><b>Advogado:</b> {modalDetalhes.processo.advogado_responsavel?.nome}</p>
            <p><b>Valor da Causa:</b> R$ {modalDetalhes.processo.valor_causa?.toLocaleString()}</p>
            <p>
              <b>Data de Abertura:</b>{" "}
              {modalDetalhes.processo.data_abertura
                ? dayjs(modalDetalhes.processo.data_abertura).format("DD/MM/YYYY")
                : "—"}
            </p>
            {modalDetalhes.processo.data_encerramento && (
              <p>
                <b>Data de Encerramento:</b>{" "}
                {dayjs(modalDetalhes.processo.data_encerramento).format("DD/MM/YYYY")}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* === Modal Documentos === */}
      <Modal
        title="Documentos Pendentes"
        open={documentosModal.visible}
        onCancel={() => setDocumentosModal({ visible: false, lista: [] })}
        footer={null}
      >
        <ul style={{ listStyle: "none", padding: 0 }}>
          {documentosModal.lista.length > 0 ? (
            documentosModal.lista.map((doc) => (
              <li key={doc.id} style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}>
                <span>{doc.descricao || "(sem descrição)"}</span>
              </li>
            ))
          ) : (
            <p>Nenhum documento pendente.</p>
          )}
        </ul>
      </Modal>

      {/* === Modal Prazos === */}
      <Modal
        title="Prazos Processuais"
        open={prazosModal.visible}
        onCancel={() => setPrazosModal({ visible: false, lista: [] })}
        footer={null}
      >
        <ul style={{ listStyle: "none", padding: 0 }}>
          {prazosModal.lista.length > 0 ? (
            prazosModal.lista.map((prazo) => (
              <li key={prazo.id} style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}>
                <span>
                  {prazo.assunto || prazo.descricao || "(sem assunto)"} —{" "}
                  {dayjs(prazo.dataHora).format("DD/MM/YYYY HH:mm")}
                </span>
              </li>
            ))
          ) : (
            <p>Nenhum prazo pendente.</p>
          )}
        </ul>
      </Modal>
    </div>
  );
};

export default ProcessosPage;
