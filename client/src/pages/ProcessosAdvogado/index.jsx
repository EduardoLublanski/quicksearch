import React, { useState, useEffect } from "react";
import {
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  ConfigProvider,
  Space,
  Popconfirm,
  message,
  Select
} from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import ptBR from "antd/es/locale/pt_BR";
import "dayjs/locale/pt-br";

import { useAuth } from "../../services/authContex.js"
import { createApiService } from "../../services/api.js";

const { Option } = Select;

dayjs.locale("pt-br");

const ProcessosAdvogado = () => {
  const { codigoOAB } = useParams();
  const { authAxios, roles } = useAuth();
  const quickSearchApi = createApiService(authAxios);

  const [processos, setProcessos] = useState([]);
  const [documentosModal, setDocumentosModal] = useState({ visible: false, processoId: null, lista: [] });
  const [prazosModal, setPrazosModal] = useState({ visible: false, processoId: null, lista: [] });
  const [modalEdicao, setModalEdicao] = useState({ visible: false, processo: null });
  const [modalDetalhes, setModalDetalhes] = useState({ visible: false, processo: null });

  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = message.useMessage();
  const [formDoc] = Form.useForm();
  const [formPrazo] = Form.useForm();
  const [formEdicao] = Form.useForm();

  const isADM = roles.includes("ROLE_ADMIN")
  const isUSER = roles.includes("ROLE_USER")
  const isMANAGER = roles.includes("ROLE_MANAGER")

  const navigate = useNavigate()

  const disablePastDates = (current) => {
    return current && current < dayjs().startOf("minute");
  };

  // Impede horas/minutos anteriores ao momento atual (apenas se for o mesmo dia)
  const disablePastTimes = () => {
    const now = dayjs();
    return {
      disabledHours: () => [...Array(now.hour()).keys()],
      disabledMinutes: () => [...Array(now.minute()).keys()],
      disabledSeconds: () => [...Array(now.second()).keys()],
    };
  };

  // === Carregar processos ===
  const carregarProcessos = async () => {
    try {
      const res = await quickSearchApi.listProcessos();
      if (res.data && Array.isArray(res.data)) {
        const lista = res.data
          .filter(
            (p) =>
              p.advogado_responsavel?.codigo_oab?.toLowerCase() ===
              codigoOAB.toLowerCase()
          )
          .sort((a, b) => new Date(a.data_abertura) - new Date(b.data_abertura));
        setProcessos(lista);
      }
    } catch (error) {
      console.error(error);
      api.error("Erro ao carregar processos.");
    }
  };

  useEffect(() => {
    carregarProcessos();
  }, [codigoOAB]);

  // === Documentos ===
  const abrirModalDocumentos = async (processoId) => {
    try {
      const res = await quickSearchApi.listDocumentos(processoId);
      setDocumentosModal({ visible: true, processoId, lista: res.data || [] });
    } catch (error) {
      console.error(error);
      api.error("Erro ao carregar documentos.");
    }
  };

  const adicionarDocumento = async () => {
    try {
      const { descricao } = formDoc.getFieldsValue();
      if (!descricao) return api.error("Preencha descrição.");

      await quickSearchApi.addDocumentoByProcessoId(documentosModal.processoId, { descricao });
      api.success("Documento adicionado!");
      formDoc.resetFields();

      const res = await quickSearchApi.listDocumentos(documentosModal.processoId);
      setDocumentosModal((prev) => ({ ...prev, lista: res.data || [] }));
      carregarProcessos();
    } catch (error) {
      console.error(error);
      api.error("Erro ao adicionar documento.");
    }
  };

  const excluirDocumento = async (docId) => {
    try {
      await quickSearchApi.deleteDocumento(documentosModal.processoId, docId);
      api.success("Documento removido!");
      const res = await quickSearchApi.listDocumentos(documentosModal.processoId);
      setDocumentosModal((prev) => ({ ...prev, lista: res.data || [] }));
      carregarProcessos();
    } catch (error) {
      console.error(error);
      api.error("Erro ao remover documento.");
    }
  };

  // === Prazos ===
  const abrirModalPrazos = async (processoId) => {
    try {
      const res = await quickSearchApi.listPrazos(processoId);
      setPrazosModal({ visible: true, processoId, lista: res.data || [] });
    } catch (error) {
      console.error(error);
      api.error("Erro ao carregar prazos.");
    }
  };

   const adicionarPrazo = async () => {
  try {
    const { assunto, prazo } = formPrazo.getFieldsValue();
    if (!assunto || !prazo) return api.error("Preencha assunto e prazo.");

    const data_hora = prazo.format("YYYY-MM-DDTHH:mm:ss");
    console.log(assunto)
    console.log(data_hora)
    await quickSearchApi.addPrazoByProcessoId(prazosModal.processoId, { assunto, data_hora });
    api.success("Prazo adicionado!");
    formPrazo.resetFields();

    const res = await quickSearchApi.listPrazos(prazosModal.processoId);
    setPrazosModal((prev) => ({ ...prev, lista: res.data || [] }));
    carregarProcessos();
  } catch (error) {
    console.error(error);
    api.error("Erro ao adicionar prazo.");
  }
};

  const excluirPrazo = async (prazoId) => {
    try {
      await quickSearchApi.deletePrazo(prazosModal.processoId, prazoId);
      api.success("Prazo removido!");
      const res = await quickSearchApi.listPrazos(prazosModal.processoId);
      setPrazosModal((prev) => ({ ...prev, lista: res.data || [] }));
      carregarProcessos();
    } catch (error) {
      console.error(error);
      api.error("Erro ao remover prazo.");
    }
  };

  // === Edição de processo ===
  const editarProcesso = (processo) => {
    setModalEdicao({ visible: true, processo });
    formEdicao.setFieldsValue({
      ...processo,
      dataAbertura: processo.data_abertura ? dayjs(processo.data_abertura) : null,
      dataEncerramento: processo.data_encerramento ? dayjs(processo.data_encerramento) : null,
      valorCausa: processo.valor_causa,
    });
  };

  const salvarEdicao = async () => {
    try {
      const valores = formEdicao.getFieldsValue();

      const atualizado = {
        id: modalEdicao.processo.id,
        numero: modalEdicao.processo.numero,
        data_abertura: valores.dataAbertura
          ? valores.dataAbertura.format("YYYY-MM-DD")
          : modalEdicao.processo.data_abertura,
        data_encerramento: valores.dataEncerramento
          ? valores.dataEncerramento.format("YYYY-MM-DD")
          : modalEdicao.processo.data_encerramento,
        status: valores.status || modalEdicao.processo.status,
        descricao: modalEdicao.processo.descricao,
        tipo: modalEdicao.processo.tipo,
        vara: modalEdicao.processo.vara,
        valor_causa: valores.valorCausa || modalEdicao.processo.valor_causa,
        codigo_oab: modalEdicao.processo.advogado_responsavel?.codigo_oab,
        cliente_cpf: modalEdicao.processo.cliente?.cpf,
        localizacao: valores.localizacao || modalEdicao.processo.localizacao,
      };

      await quickSearchApi.updateProcesso(atualizado.id, atualizado);
      api.success("Processo atualizado!");
      setModalEdicao({ visible: false, processo: null });
      carregarProcessos();
    } catch (error) {
      console.error(error);
      api.error("Erro ao atualizar processo.");
    }
  };

  // === Exclusão ===
  const excluirProcesso = async (id) => {
    try {
      await quickSearchApi.deleteProcessoById(id);
      api.success("Processo excluído!");
      carregarProcessos();
    } catch (error) {
      console.error(error);
      api.error("Erro ao excluir processo.");
    }
  };

  // === Detalhes ===
  const abrirDetalhes = (processo) => setModalDetalhes({ visible: true, processo });

  // === Colunas ===
  const columns = [
    { title: "Número", dataIndex: "numero", key: "numero" },
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      render: (cliente) => {
         if (!cliente.nome) return "-";
    return (
      <a target="_blank" rel="noopener noreferrer" onClick={(e) => {
        navigate(`/cliente/${cliente.cpf}/processos`)
        }}>
        {cliente.nome}
      </a>
    );
      }
    },
    {
      title: "Data de Abertura",
      dataIndex: "data_abertura",
      key: "data_abertura",
      render: (data) => (data ? dayjs(data).format("DD/MM/YYYY") : "-"),
    },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Tipo", dataIndex: "tipo", key: "tipo" },
    { title: "Vara", dataIndex: "vara", key: "vara" },
    {
  title: "Localização",
  dataIndex: "localizacao",
  key: "localizacao",
  render: (localizacao) => {
    if (!localizacao) return "-";
    const url = localizacao.startsWith("http") ? localizacao : `https://${localizacao}`;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
        {localizacao}
      </a>
    );
  },
},
    {
      title: "Valor da Causa",
      dataIndex: "valor_causa",
      key: "valor_causa",
      render: (v) => (v != null ? `R$ ${v.toLocaleString()}` : "-"),
    },
    {
  title: "Documentos",
  key: "documentos",
  render: (_, record) => (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Badge
        count={record.documentos_pendentes?.length || 0}
        showZero
        style={{ backgroundColor: "#faad14", cursor: "pointer" }}
      >
        <Button
          type="text"
          icon={<FileTextOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            abrirModalDocumentos(record.id);
          }}
        />
      </Badge>
    </div>
  ),
},
{
  title: "Prazos",
  key: "prazos",
  render: (_, record) => (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Badge
        count={record.prazos_processuais?.length || 0}
        showZero
        style={{ backgroundColor: "#52c41a", cursor: "pointer" }}
      >
        <Button
          type="text"
          icon={<ClockCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            abrirModalPrazos(record.id);
          }}
        />
      </Badge>
    </div>
  ),
},

    {
  title: "Ações",
  key: "acoes",
  render: (_, record) => (
    <Space>
      <Button
        icon={<EyeOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          abrirDetalhes(record);
        }}
      >
        Ver
      </Button>

      <Button
        type="primary"
        disabled={!(isADM || isUSER || isMANAGER)}
        onClick={(e) => {
          e.stopPropagation();
          editarProcesso(record);
        }}
      >
        Editar
      </Button>

      <Popconfirm
        title="Deseja realmente excluir este processo?"
        onConfirm={(e) => {
          e?.stopPropagation();
          excluirProcesso(record.id);
        }}
        okText="Sim"
        cancelText="Não"
      >
        <Button
          danger
          disabled={!(isADM || isMANAGER)}
          onClick={(e) => e.stopPropagation()}
        >
          Excluir
        </Button>
      </Popconfirm>
    </Space>
  ),
}

  ];

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => window.history.back()}
      >
        Voltar
      </Button>
      <h2>Processos do Advogado (OAB: {codigoOAB})</h2>
      <Table rowKey="id" columns={columns} dataSource={processos} bordered/>

      {/* === Modal Detalhes === */}
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
      
                  <p><b>Cliente:</b></p>
                  <ul style={{ paddingLeft: 20 }}>
                    <li><b>Nome:</b> {modalDetalhes.processo.cliente?.nome}</li>
                    <li><b>CPF:</b> {modalDetalhes.processo.cliente?.cpf}</li>
                    <li><b>Telefone:</b> {modalDetalhes.processo.cliente?.telefone}</li>
                    <li><b>Email:</b> {modalDetalhes.processo.cliente?.email}</li>
                  </ul>
      
                  <p><b>Advogado Responsável:</b></p>
                  <ul style={{ paddingLeft: 20 }}>
                    <li><b>Nome:</b> {modalDetalhes.processo.advogado_responsavel?.nome}</li>
                    <li><b>OAB:</b> {modalDetalhes.processo.advogado_responsavel?.codigo_oab}</li>
                    <li><b>Email:</b> {modalDetalhes.processo.advogado_responsavel?.email}</li>
                  </ul>
      
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

      {/* Modal Documentos */}
            <Modal
              title="Documentos Pendentes"
              open={documentosModal.visible}
              onCancel={() => setDocumentosModal({ visible: false, processoId: null, lista: [] })}
              footer={null}
            >
              <ul style={{ listStyle: "none", padding: 0 }}>
                {documentosModal.lista.map((doc) => (
                  <li key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                    <span>{doc.descricao || "(sem descrição)"}</span>
                    <Popconfirm
                      title="Excluir este documento?"
                      onConfirm={() => excluirDocumento(doc.id)}
                      okText="Sim"
                      cancelText="Não"
                    >
                      <Button danger disabled={!(isADM || isUSER || isMANAGER)} size="small">Excluir</Button>
                    </Popconfirm>
                  </li>
                ))}
                {documentosModal.lista.length === 0 && <p>Nenhum documento cadastrado.</p>}
              </ul>
      
              <Form form={formDoc} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item label="Descrição" name="descricao" rules={[{ required: true, message: "Preencha a descrição." }]}>
                  <Input.TextArea disabled={!(isADM || isUSER || isMANAGER)}/>
                </Form.Item>
                <Button type="primary" disabled={!(isADM || isUSER || isMANAGER)} icon={<PlusOutlined />} onClick={adicionarDocumento}>
                  Adicionar Documento
                </Button>
              </Form>
            </Modal>
      
            {/* Modal Prazos */}
            <Modal
        title="Prazos Processuais"
        open={prazosModal.visible}
        onCancel={() => setPrazosModal({ visible: false, processoId: null, lista: [] })}
        footer={null}
      >
        <ul style={{ listStyle: "none", padding: 0 }}>
          {prazosModal.lista.map((prazo) => (
            <li
              key={prazo.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: "1px solid #eee",
              }}
            >
             <span>
        {prazo.assunto || "(sem assunto)"} —{" "}
        {dayjs(prazo.dataHora, "YYYY-MM-DDTHH:mm:ss", true).format("DD/MM/YYYY HH:mm")}
      </span>
      
              <Popconfirm
                title="Excluir este prazo?"
                onConfirm={() => excluirPrazo(prazo.id)}
                okText="Sim"
                cancelText="Não"
              >
                <Button danger disabled={!(isADM || isUSER || isMANAGER)} size="small">
                  Excluir
                </Button>
              </Popconfirm>
            </li>
          ))}
          {prazosModal.lista.length === 0 && <p>Nenhum prazo cadastrado.</p>}
        </ul>
      
        <Form form={formPrazo} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Assunto" name="assunto" rules={[{ required: true }]}>
            <Input disabled={!(isADM || isUSER || isMANAGER)} />
          </Form.Item>
      
          <Form.Item
            label="Prazo"
            name="prazo"
            rules={[{ required: true, message: "Selecione a data do prazo." }]}
          >
            <DatePicker
              showTime
              disabled={!(isADM || isUSER || isMANAGER)}
              disabledDate={disablePastDates}
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
            />
          </Form.Item>
      
          <Button
            type="primary"
            disabled={!(isADM || isUSER || isMANAGER)}
            icon={<PlusOutlined />}
            onClick={adicionarPrazo}
          >
            Adicionar Prazo
          </Button>
        </Form>
      </Modal>
      {/* Edição */}
<Modal
  title="Editar Processo"
  okText="Salvar"
  cancelText="Cancelar"
  open={modalEdicao.visible}
  onCancel={() => setModalEdicao({ visible: false, processo: null })}
  onOk={salvarEdicao}
>
  <Form form={formEdicao} layout="vertical">
    <Form.Item label="Número" name="numero">
      <Input placeholder="Digite o número do processo" disabled />
    </Form.Item>

    <Form.Item label="Tipo" name="tipo">
      <Input placeholder="Tipo do processo" disabled />
    </Form.Item>

    <Form.Item label="Vara" name="vara">
      <Input placeholder="Número da vara" disabled />
    </Form.Item>

    <Form.Item label="Descrição" name="descricao">
      <Input.TextArea rows={2} placeholder="Descrição do processo" disabled />
    </Form.Item>

    <Form.Item label="Localização" name="localizacao">
      <Input placeholder="Link ou localização do processo" />
    </Form.Item>

    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                  <Select placeholder="Selecione o status do processo">
                    <Option value="Ativo">Ativo</Option>
                    <Option value="Suspenso">Suspenso</Option>
                    <Option value="Arquivado">Arquivado</Option>
                  </Select>
                </Form.Item>

    <Form.Item label="Valor da Causa" name="valorCausa">
      <Input type="number" placeholder="Informe o valor da causa" />
    </Form.Item>

    <Form.Item label="Data de Abertura" name="dataAbertura">
      <ConfigProvider locale={ptBR}>
        <DatePicker format="DD/MM/YYYY" disabled placeholder="Data de abertura" />
      </ConfigProvider>
    </Form.Item>

    <Form.Item label="Data de Encerramento" name="dataEncerramento">
      <ConfigProvider locale={ptBR}>
        <DatePicker format="DD/MM/YYYY" disabledDate={disablePastDates} placeholder="Selecione a data de encerramento" />
      </ConfigProvider>
    </Form.Item>
  </Form>
</Modal>

    </div>
  );
};

export default ProcessosAdvogado;
