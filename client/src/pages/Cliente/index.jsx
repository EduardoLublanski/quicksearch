import React, { useState, useEffect } from "react";
import { getInfoByCep } from "../../services/viacep.js";
import { useAuth } from "../../services/authContex.js";
import { createApiService } from "../../services/api.js";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Space,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Cliente = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ cpf: "", nome: "" });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  const { authAxios } = useAuth();
  const quickSearchApi = createApiService(authAxios);

  const { roles } = useAuth();
  const isUSER = roles.includes("ROLE_USER");
  const isADM = roles.includes("ROLE_ADMIN");
  const isMANAGER = roles.includes("ROLE_MANAGER");

  const [form] = Form.useForm();
  const [api, contextHolder] = message.useMessage();

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const listClientes = await quickSearchApi.listClientes();
      setClientes(listClientes.data);
      setFiltered(listClientes.data);
    } catch (err) {
      console.error(err);
      api.error("Erro ao carregar clientes!");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtro por CPF e Nome
  const handleFilter = (e, field) => {
    const value = e.target.value.toLowerCase();
    const updated = { ...filters, [field]: value };
    setFilters(updated);

    const filteredList = clientes.filter((c) => {
      const cpfMatch = c.cpf.toLowerCase().includes(updated.cpf);
      const nomeMatch = c.nome.toLowerCase().includes(updated.nome);
      return cpfMatch && nomeMatch;
    });

    setFiltered(filteredList);
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value;
    if (cep.length !== 8) return;

    try {
      const response = await getInfoByCep(cep);
      const data = response.data;

      if (data.erro) {
        api.warning("CEP não encontrado!");
        return;
      }

      form.setFieldsValue({
        rua: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      });

      api.success("Endereço preenchido automaticamente!");
    } catch (err) {
      console.error(err);
      api.error("Erro ao buscar CEP!");
    }
  };

  const handleAdd = () => {
    setEditingCliente(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCliente(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (cpf) => {
    try {
      await quickSearchApi.deleteClienteByCpf(cpf);
      await loadClientes();
      api.success("Cliente excluído com sucesso!");
    } catch (err) {
      console.error(err);
      api.error("Erro ao excluir cliente!");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCliente) {
        await quickSearchApi.updateCliente(values);
        api.success("Cliente atualizado com sucesso!");
      } else {
        await quickSearchApi.registerCliente(values);
        api.success("Cliente cadastrado com sucesso!");
      }
      await loadClientes();
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      api.error("Erro ao salvar cliente!");
    }
  };

  const columns = [
    { title: "CPF", dataIndex: "cpf", key: "cpf" },
    { title: "Nome", dataIndex: "nome", key: "nome" },
    { title: "Telefone", dataIndex: "telefone", key: "telefone" },
    { title: "Cidade", dataIndex: "cidade", key: "cidade" },
    {
      title: "Ações",
      key: "acoes",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            disabled={!(isADM || isUSER || isMANAGER)}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir?"
            okText="Sim"
            cancelText="Não"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record.cpf);
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button
              danger
              disabled={!(isADM || isMANAGER)}
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      <h2>Gerenciamento de Clientes</h2>

      {/* 🔍 Campos de Filtro */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input
          placeholder="Filtrar por CPF"
          value={filters.cpf}
          onChange={(e) => handleFilter(e, "cpf")}
          style={{ width: 200 }}
        />
        <Input
          placeholder="Filtrar por Nome"
          value={filters.nome}
          onChange={(e) => handleFilter(e, "nome")}
          style={{ width: 200 }}
        />
        <Button
          onClick={() => {
            setFilters({ cpf: "", nome: "" });
            setFiltered(clientes);
          }}
        >
          Limpar
        </Button>
        <Button
          type="primary"
          disabled={!(isADM || isUSER || isMANAGER)}
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Cadastrar Cliente
        </Button>
      </div>

      {/* 🧾 Tabela */}
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="cpf"
        loading={loading}
        onRow={(record) => ({
          onClick: () => navigate(`/cliente/${record.cpf}/processos`),
        })}
        pagination={{ pageSize: 10 }}
      />

      {/* 🧱 Modal */}
      <Modal
        title={editingCliente ? "Editar Cliente" : "Cadastrar Cliente"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText={editingCliente ? "Salvar" : "Cadastrar"}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="cpf"
            label="CPF"
            rules={[
              { required: true, message: "Informe o CPF" },
              {
                pattern: /^\d{11}$/,
                message: "CPF deve conter exatamente 11 dígitos numéricos",
              },
            ]}
          >
            <Input
              disabled={!!editingCliente}
              placeholder="Apenas números (11 dígitos)"
            />
          </Form.Item>

          <Form.Item
            name="nome"
            label="Nome"
            rules={[
              { required: true, message: "Informe o nome" },
              { min: 3, message: "O nome deve ter pelo menos 3 caracteres" },
            ]}
          >
            <Input placeholder="Nome completo" />
          </Form.Item>

          <Form.Item
            name="telefone"
            label="Telefone"
            rules={[
              { required: true, message: "Informe o telefone" },
              {
                pattern:
                  /^(\(?\d{2}\)?\s?)?(9?\s?\d{4}-?\d{4})$/,
                message: "Formato inválido. Ex: (11) 98797-7651",
              },
            ]}
          >
            <Input placeholder="(00) 00000-0000" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Informe o email" },
              {
                type: "email",
                message: "Formato de email inválido. Ex: exemplo@email.com",
              },
            ]}
          >
            <Input placeholder="exemplo@email.com" />
          </Form.Item>

          <Form.Item
            name="cep"
            label="CEP"
            rules={[
              { required: true, message: "Informe o CEP" },
              {
                pattern: /^\d{8}$/,
                message: "CEP deve conter exatamente 8 dígitos numéricos",
              },
            ]}
          >
            <Input placeholder="00000000" onBlur={handleCepBlur} />
          </Form.Item>

          <Form.Item
            name="rua"
            label="Rua"
            rules={[{ required: true, message: "Informe a rua" }]}
          >
            <Input placeholder="nome da rua" />
          </Form.Item>

          <Form.Item
            name="numero"
            label="Número"
            rules={[
              { required: true, message: "Informe o número" },
              {
                pattern: /^[0-9]+$/,
                message: "O número deve conter apenas dígitos",
              },
            ]}
          >
            <Input placeholder="número da casa" />
          </Form.Item>

          <Form.Item
            name="bairro"
            label="Bairro"
            rules={[{ required: true, message: "Informe o bairro" }]}
          >
            <Input placeholder="nome do bairro" />
          </Form.Item>

          <Form.Item
            name="cidade"
            label="Cidade"
            rules={[{ required: true, message: "Informe a cidade" }]}
          >
            <Input placeholder="nome da cidade" />
          </Form.Item>

          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: "Informe o estado" }]}
          >
            <Input placeholder="sigla do estado (SP, MG, SC...)" />
          </Form.Item>

          <Form.Item name="complemento" label="Complemento">
            <Input placeholder="apartamento, bloco, referência" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Cliente;
