import React, { useState, useEffect } from "react";
import { Table, Button, Input, Modal, Form, message, Popconfirm, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/authContex.js"
import { createApiService } from "../../services/api.js";


const Advogado = () => {
  const navigate = useNavigate();
  const [advogados, setAdvogados] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAdvogado, setEditingAdvogado] = useState(null);
  const [form] = Form.useForm();
  const [api, contextHolder] = message.useMessage();
  const { authAxios } = useAuth();
  const quickSearchApi = createApiService(authAxios);

  const { roles } = useAuth()
  const isADM = roles.includes("ROLE_ADMIN")
  const isUSER = roles.includes("ROLE_USER")
  const isMANAGER = roles.includes("ROLE_MANAGER")

  // Listagem inicial
  const list = async () => {
    setLoading(true);
    try {
      const response = await quickSearchApi.listAdvogados();
      setAdvogados(response.data);
      setFiltered(response.data);
    } catch (err) {
      console.error(err);
      message.error("Erro ao listar advogados!");
    }
    setLoading(false);
  };

  useEffect(() => {
    list();
  }, []);

  // Filtragem
  const handleFilter = (e) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) setFiltered(advogados);
    else setFiltered(advogados.filter((a) => a.codigo_oab.toLowerCase().includes(value)));
  };

  // Abrir modal
  const handleAdd = () => {
    setEditingAdvogado(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingAdvogado(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // Excluir advogado
  const handleDelete = async (codigo_oab) => {
    try {
      await quickSearchApi.deleteAdvogadoByOAB(codigo_oab);
      api.success("Advogado excluído com sucesso!");
      await list();
    } catch (err) {
      console.error(err);
      api.error("Erro ao excluir advogado!");
    }
  };

  // Submeter formulário
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingAdvogado) {
        await quickSearchApi.updateAdvogado(values);
        api.success("Advogado atualizado com sucesso!");
      } else {
        await quickSearchApi.registerAdvogado(values);
        api.success("Advogado cadastrado com sucesso!");
      }
      setModalVisible(false);
      await list();
    } catch (err) {
      console.error(err);
      api.error("Erro ao salvar advogado!");
    }
  };

  const columns = [
  { title: "Código OAB", dataIndex: "codigo_oab", key: "codigo_oab" },
  { title: "Nome", dataIndex: "nome", key: "nome" },
  { title: "Telefone", dataIndex: "telefone", key: "telefone" },
  { title: "Email", dataIndex: "email", key: "email" },
  {
    title: "Ações",
    key: "acoes",
    render: (_, record) => (
      <Space>
        <Button
          icon={<EditOutlined />}
          disabled={!(isADM || isMANAGER)}
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
            handleDelete(record.codigo_oab);
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
      
      <h2>Gerenciamento de Advogados</h2>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input placeholder="Filtrar por código OAB" onChange={handleFilter} style={{ width: 250 }} />
        
        <Button type="primary"  disabled={!(isADM || isMANAGER)} icon={<PlusOutlined />} onClick={handleAdd}>
          Cadastrar Advogado
        </Button>
        
        
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="codigo_oab"
        loading={loading}
        onRow={(record) => ({
          onClick: () => navigate(`/advogado/${record.codigo_oab}/processos`),
        })}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingAdvogado ? "Editar Advogado" : "Cadastrar Advogado"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText={editingAdvogado ? "Salvar" : "Cadastrar"}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
  name="codigo_oab"
  label="Código OAB"
  rules={[
    { required: true, message: "Informe o código OAB" },
    {
      validator: (_, value) => {
        if (!value) return Promise.resolve();
        const regex = /^[A-Z]{2}\d{3,6}$/;

        return regex.test(value)
          ? Promise.resolve()
          : Promise.reject("Código OAB inválido. Ex: SP/12345");
      },
    },
  ]}
>
  <Input placeholder="Ex: SP123456" disabled={!(isADM || isMANAGER)} />
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
                pattern: /^(\(?\d{2}\)?\s?)?(9?\s?\d{4}-?\d{4})$/,
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
              {
                required: true,
                message: "Informe o email",
              },
              {
                type: "email",
                message: "Formato de email inválido. Ex: exemplo@email.com",
              },
            ]}
          >
            <Input placeholder="exemplo@email.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Advogado;
