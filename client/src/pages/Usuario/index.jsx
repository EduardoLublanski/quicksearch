import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Popconfirm,
  message,
  Card,
  Input,
} from "antd";
import { useAuth } from "../../services/authContex.js";
import { createApiService } from "../../services/api.js";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const Usuario = () => {
  const { authAxios } = useAuth();
  const apiService = createApiService(authAxios);

  const [usuarios, setUsuarios] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRoleUser, setEditingRoleUser] = useState(null);

  const [formUser] = Form.useForm();
  const [formRole] = Form.useForm();
  const [api, contextHolder] = message.useMessage();

  const navigate = useNavigate()

  const roleLabels = {
    ROLE_USER: "Usuário",
    ROLE_GUEST: "Convidado",
    ROLE_MANAGER: "Gerente",
    ROLE_ADMIN: "Administrador",
  };

  // --- CRUD ---
  const listUsuario = async () => {
    try {
      const { data } = await apiService.listUsuario();
      setUsuarios(data);
    } catch {
      api.error("Erro ao listar usuários.");
    }
  };

  const registerUsuario = async (usuario) => {
    try {
      await apiService.registerUsuario(usuario);
      api.success("Usuário criado com sucesso!");
      listUsuario();
    } catch {
      api.error("Erro ao criar usuário.");
    }
  };

  const updateUsuario = async (usuario) => {
    try {
      await apiService.updateUsuario(usuario);
      api.success("Usuário atualizado com sucesso!");
      listUsuario();
    } catch {
      api.error("Erro ao atualizar usuário.");
    }
  };

  const updateUsuarioRole = async (usuarioId, newRole) => {
    try {
      await apiService.updateUsuarioRole(usuarioId, { new_user_role: newRole });
      api.success("Permissão atualizada com sucesso!");
      listUsuario();
    } catch {
      api.error("Erro ao atualizar permissão.");
    }
  };

  const deleteUsuarioById = async (usuarioId) => {
    try {
      await apiService.deleteUsuarioById(usuarioId);
      api.success("Usuário excluído com sucesso!");
      listUsuario();
    } catch {
      api.error("Erro ao excluir usuário.");
    }
  };

  useEffect(() => {
    listUsuario();
  }, []);

  // --- MODAIS ---
  const openCreateModal = () => {
    setEditingUser(null);
    formUser.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (record) => {
    setEditingUser(record);
    formUser.setFieldsValue({
      username: record.username,
      roles: record.roles?.[0] || null,
    });
    setIsModalVisible(true);
  };

  const openEditRoleModal = (record) => {
    setEditingRoleUser(record);
    formRole.setFieldsValue({
      roles: record.roles?.[0] || null,
    });
    setIsRoleModalVisible(true);
  };

  const handleCancelUser = () => {
    formUser.resetFields();
    setEditingUser(null);
    setIsModalVisible(false);
  };

  const handleOkUser = async () => {
  try {
    const values = await formUser.validateFields();

    const payload = {
      id: editingUser?.id || null,
      username: values.username,
      password: values.password, // 👈 usa 'passcode' como no back
      roles: Array.isArray(values.roles)
        ? values.roles
        : [values.roles], // 👈 apenas array de strings
    };

    if (editingUser) {
      await updateUsuario(payload);
    } else {
      await registerUsuario(payload);
    }

    formUser.resetFields();
    setIsModalVisible(false);
  } catch (error) {
    console.error(error);
    message.error("Erro ao salvar o usuário.");
  }
};


  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Login", dataIndex: "login", key: "login" },
    {
      title: "Permissão",
      dataIndex: "roles",
      key: "roles",
      render: (roles) =>
        roles?.length ? roleLabels[roles[0]] || roles[0] : "-",
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => {
        const isAdmin = record.roles?.includes("ROLE_ADMIN");
        return (
          <>
            <Button type="link" onClick={() => openEditModal(record)}>
              Editar
            </Button>
            <Button type="link" onClick={() => openEditRoleModal(record)}>
              Editar Permissão
            </Button>
            <Popconfirm
              title="Tem certeza que deseja excluir este usuário?"
              onConfirm={() => deleteUsuarioById(record.id)}
              okText="Sim"
              cancelText="Não"
              disabled={isAdmin}
            >
              <Button type="link" danger disabled={isAdmin}>
                Excluir
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <Card title="Gerenciamento de Usuários" style={{ borderRadius: 10 }}>
      {contextHolder}
      <Button
        type="primary"
        onClick={openCreateModal}
        style={{ marginBottom: 16 }}
      >
        Novo Usuário
      </Button>

      <Table
        dataSource={usuarios}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />

      {/* Modal de edição de role */}
      <Modal
        title="Editar Permissão"
        open={isRoleModalVisible}
        onOk={async () => {
          const values = await formRole.validateFields();
          await updateUsuarioRole(editingRoleUser.id, values.roles);
          setIsRoleModalVisible(false);
          setEditingRoleUser(null);
          formRole.resetFields();
        }}
        onCancel={() => {
          setIsRoleModalVisible(false);
          setEditingRoleUser(null);
          formRole.resetFields();
        }}
        destroyOnClose
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={formRole} layout="vertical">
          <Form.Item
            name="roles"
            label="Permissão"
            rules={[{ required: true, message: "Selecione uma role." }]}
          >
            <Select
              placeholder="Selecione uma role"
              disabled={editingRoleUser?.roles?.includes("ROLE_ADMIN")}
            >
              <Option value="ROLE_USER">Usuário</Option>
              <Option value="ROLE_GUEST">Convidado</Option>
              <Option value="ROLE_MANAGER">Gerente</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de criação/edição de usuário completo */}
      <Modal
        title={editingUser ? "Editar Usuário" : "Novo Usuário"}
        open={isModalVisible}
        onOk={ async () => {
         await handleOkUser()
          if(editingUser?.roles?.includes("ROLE_ADMIN")) window.location.href = "/"; 
        }}
        onCancel={handleCancelUser}
        destroyOnClose
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={formUser} layout="vertical">
          {/* LOGIN */}
          <Form.Item
            name="username"
            label="Login"
            rules={[
              { required: true, message: "Informe o login do usuário." },
              { min: 4, message: "O login deve ter pelo menos 4 caracteres." },
              { max: 20, message: "O login deve ter no máximo 20 caracteres." },
              {
                pattern: /^[a-zA-Z0-9._-]+$/,
                message:
                  "O login deve conter apenas letras, números, pontos, hífens ou underscores.",
              },
            ]}
          >
            <Input placeholder="ex: joao.silva" />
          </Form.Item>

          {/* SENHA */}
          <Form.Item
            name="password"
            label="Senha"
            hasFeedback
            rules={[
              { required: true, message: "Informe a senha." },
              { min: 8, message: "A senha deve ter pelo menos 8 caracteres." },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()[\]])[A-Za-z\d@$!%*?&()[\]]+$/,
                message:
                  "A senha deve conter letra maiúscula, minúscula, número e caractere especial.",
              },
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          {/* CONFIRMAR SENHA */}
          <Form.Item
            name="confirmPassword"
            label="Confirme a Senha"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Confirme a senha." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value !== getFieldValue("password")) {
                    return Promise.reject("As senhas não conferem.");
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          {/* ROLE */}
          <Form.Item
            name="roles"
            label="Permissão"
            rules={[{ required: true, message: "Selecione uma role." }]}
          >
            <Select
              placeholder="Selecione uma role"
              disabled={editingUser?.roles?.includes("ROLE_ADMIN")}
            >
              <Option value="ROLE_USER">Usuário</Option>
              <Option value="ROLE_GUEST">Convidado</Option>
              <Option value="ROLE_MANAGER">Gerente</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Usuario;
