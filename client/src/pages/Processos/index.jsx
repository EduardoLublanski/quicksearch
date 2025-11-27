import React, { useState, useEffect } from "react";
import { useAuth } from "../../services/authContex.js";
import { createApiService } from "../../services/api.js";

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
  Typography,
  Select
} from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import ptBR from "antd/es/locale/pt_BR";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { debounce } from "lodash";

dayjs.locale("pt-br");

const { Title } = Typography;
const { Option } = Select;

const Processos = () => {
  const { cpf } = useParams();
  const { authAxios } = useAuth();
  const quickSearchApi = createApiService(authAxios);

  const [processos, setProcessos] = useState([]);
  const [advogadoNome, setAdvogadoNome] = useState("");
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState({ visible: false, processo: null });
  const [documentosModal, setDocumentosModal] = useState({ visible: false, processoId: null, lista: [] });
  const [prazosModal, setPrazosModal] = useState({ visible: false, processoId: null, lista: [] });

  const [api, contextHolder] = message.useMessage();
  const [formCadastro] = Form.useForm();
  const [formDoc] = Form.useForm();
  const [formPrazo] = Form.useForm();

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

  const { roles } = useAuth();
  const isADM = roles.includes("ROLE_ADMIN")
  const isUSER = roles.includes("ROLE_USER")
  const isMANAGER = roles.includes("ROLE_MANAGER")

  const carregarProcessos = async () => {
    try {
      
      const res = await quickSearchApi.listProcessos();
      if (res.data && Array.isArray(res.data)) {
        const lista = res.data.filter((p) => p.cliente.cpf === cpf);
        setProcessos(lista);
      }
    } catch (error) {
      console.error(error);
      api.error("Erro ao carregar processos.");
    }
  };

  useEffect(() => {
  if (prazosModal.visible && prazosModal.lista.length > 0) {
    // Se quiser preencher o último prazo
    const ultimoPrazo = prazosModal.lista[prazosModal.lista.length - 1];

// formPrazo.setFieldsValue({
//   assunto: prazo.assunto,
//   prazo: dayjs(prazo.dataHora, "YYYY-MM-DDTHH:mm:ss", true),
// });

    formPrazo.setFieldsValue({
      assunto: ultimoPrazo.assunto,
      prazo: dayjs(ultimoPrazo.data_hora),
    });
  } else {
    // Quando o modal é fechado, limpa o formulário
    formPrazo.resetFields();
  }
}, [prazosModal.visible]);


  useEffect(() => {
  if (modalCadastro) {
    formCadastro.setFieldsValue({ status: "Ativo" });
  }
}, [modalCadastro]);

  useEffect(() => {
    carregarProcessos();
  }, [cpf]);

  const cadastrarProcesso = async () => {
    try {
      const valores = formCadastro.getFieldsValue();
      if (!valores.numero || !valores.tipo || !valores.vara) return api.error("Preencha os campos obrigatórios!");

      const novoProcesso = {
        numero: valores.numero,
        data_abertura: valores.data_abertura ? valores.data_abertura.format("YYYY-MM-DD") : null,
        data_encerramento: valores.data_encerramento ? valores.data_encerramento.format("YYYY-MM-DD") : null,
        status: valores.status,
        descricao: valores.descricao,
        tipo: valores.tipo,
        vara: valores.vara,
        valor_causa: Number(valores.valor_causa),
        codigo_oab: valores.codigo_oab,
        cliente_cpf: cpf,
        localizacao: valores.localizacao
      };

      await quickSearchApi.registerProcesso(novoProcesso);
      api.success("Processo cadastrado com sucesso!");
      setModalCadastro(false);
      formCadastro.resetFields();
      carregarProcessos();
    } catch (error) {
      console.error(error);
      api.error("Erro ao cadastrar processo.");
    }
  };

  const excluirProcesso = async (id) => {
    try {
      await quickSearchApi.deleteProcessoById(id);
      api.success("Processo excluído com sucesso!");
      carregarProcessos();
    } catch (error) {
      console.error(error);
      api.error("Erro ao excluir processo.");
    }
  };

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
      api.success("Documento excluído!");
      const res = await quickSearchApi.listDocumentos(documentosModal.processoId);
      setDocumentosModal((prev) => ({ ...prev, lista: res.data || [] }));
      carregarProcessos();
    } catch (error) {
      console.error(error);
      api.error("Erro ao excluir documento.");
    }
  };

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
      api.success("Prazo excluído!");
      const res = await quickSearchApi.listPrazos(prazosModal.processoId);
      setPrazosModal((prev) => ({ ...prev, lista: res.data || [] }));
      carregarProcessos();
    } catch (error) {
      console.error(error);
      api.error("Erro ao excluir prazo.");
    }
  };

  const columns = [
    { title: "Número", dataIndex: "numero", key: "numero" },
    {
          title: "Data de Abertura",
          dataIndex: "data_abertura",
          key: "data_abertura",
          render: (data) => (data ? dayjs(data).format("DD/MM/YYYY") : "-"),
        },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Tipo", dataIndex: "tipo", key: "tipo" },
    { title: "Cliente", key: "cliente", render: (record) => record.cliente?.nome || "-" },
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
    { title: "Responsável", key: "advogado_responsavel", render: (record) => record.advogado_responsavel?.nome || "-" },
    { title: "Valor da Causa", dataIndex: "valor_causa", key: "valor_causa", render: (v) => (v ? `R$ ${v.toLocaleString()}` : "-") },
    {
      title: "Documentos",
      key: "documentos",
      render: (_, record) => (
        <Badge
          count={record.documentos_pendentes?.length || 0}
          showZero
          style={{ backgroundColor: "#faad14", cursor: "pointer" }}
          onClick={() => abrirModalDocumentos(record.id)}
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
          onClick={() => abrirModalPrazos(record.id)}
        >
          <Button type="text" icon={<ClockCircleOutlined />} />
        </Badge>
      ),
    },
    {
      title: "Ações",
      key: "acoes",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => setModalDetalhes({ visible: true, processo: record })}>
            Ver
          </Button>
          <Popconfirm
            title="Deseja realmente excluir este processo?"
            onConfirm={() => excluirProcesso(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button danger disabled={!(isADM || isMANAGER)}>Excluir</Button>
          </Popconfirm>
        </Space>
      ),
    },
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
      <Title level={3}>Processos do Cliente (CPF: {cpf})</Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        disabled={!(isADM || isUSER || isMANAGER)}
        style={{ marginBottom: 20 }}
        onClick={() => setModalCadastro(true)}
      >
        Novo Processo
      </Button>

      <Table rowKey="id" columns={columns} dataSource={processos} bordered />

      {/* Modal Cadastro */}
      <Modal
  title="Cadastrar Processo"
  open={modalCadastro}
  onCancel={() => setModalCadastro(false)}
  onOk={cadastrarProcesso}
  okText="Cadastrar"
>
  <ConfigProvider locale={ptBR}>
    <Form form={formCadastro} layout="vertical">
            <Form.Item
              name="numero"
              label="Número"
              rules={[
                { required: true, message: "O número do processo é obrigatório." },
                { pattern: /^\d{20}$/, message: "Formato inválido." }
              ]}
            >
              <Input placeholder="1001234-56.2023.8.26.0100" />
            </Form.Item>

            <Form.Item
              name="tipo"
              label="Tipo"
              rules={[{ required: true, message: "O tipo de processo é obrigatório." }]}
            >
              <Select placeholder="Selecione o tipo de processo">
                <Option value="trabalhista">Trabalhista</Option>
                <Option value="previdenciario">Previdenciário</Option>
                <Option value="civil">Cível</Option>
                <Option value="criminal">Criminal</Option>
              </Select>
            </Form.Item>

            <Form.Item name="vara" label="Vara" rules={[{ required: true }]}>
              <Input placeholder="12" />
            </Form.Item>

            <Form.Item name="descricao" label="Descrição">
              <Input.TextArea placeholder="O processo está em fase de análise pelo procurador" />
            </Form.Item>

            <Form.Item name="localizacao" label="Localização" rules={[{ required: true }]}>
              <Input placeholder="https://drive.google.com/file/d/1j-rwIVFvRapxD" />
            </Form.Item>

            <Form.Item name="valor_causa" label="Valor da Causa" rules={[{ required: true }]}>
              <Input type="number" placeholder="3000" />
            </Form.Item>

            <Form.Item name="data_abertura" label="Data de Abertura" rules={[{ required: true }]}>
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item name="data_encerramento" label="Data de Encerramento">
              <DatePicker format="DD/MM/YYYY" disabledDate={disablePastDates} />
            </Form.Item>

            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
        <Select
          placeholder="Selecione o status do processo"
          disabled={modalCadastro} // bloqueado no cadastro
        >
          <Option value="Ativo">Ativo</Option>
          <Option value="Suspenso">Suspenso</Option>
          <Option value="Arquivado">Arquivado</Option>
        </Select>
      </Form.Item>

            <Form.Item
              name="codigo_oab"
              label="Código OAB"
              rules={[{ required: true }]}
            >
              <Input
                maxLength={20}
                placeholder="SP123456"
                onChange={debounce(async (e) => {
                  const codigo = e.target.value.trim();
                  if (!codigo) {
                    setAdvogadoNome("");
                    return;
                  }
                  try {
                    const res = await quickSearchApi.getAdvogadoByOAB(codigo);
                    setAdvogadoNome(res.data?.nome || "Advogado não encontrado");
                  } catch (error) {
                    console.error(error);
                    setAdvogadoNome("Ops! Não achei ninguém com esse código OAB 😕");
                  }
                }, 1800)}
              />
            </Form.Item>
            {advogadoNome && (
              <p style={{ marginTop: -10, marginBottom: 10, color: advogadoNome.includes("Ops!") ? "red" : "#1677ff" }}>
                <b>Advogado:</b> {advogadoNome}
              </p>
            )}
          </Form>
        </ConfigProvider>
      </Modal>

      {/* Modal Detalhes */}
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

    </div>
  );
};

export default Processos;
