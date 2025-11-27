import React from "react";
import { Form, Input, Button, Card, Typography, Checkbox, Modal } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../services/authContex.js'; // caminho correto do seu arquivo

const { Title } = Typography;

const Login = () => {

    const navigate = useNavigate()
    const { login } = useAuth();

  const onFinish = async (values) => {
  const success = await login(values.username, values.password);
  if (success) {
    navigate("/cliente"); // ou rota inicial do usuário
  } else {
    alert("Usuário ou senha inválidos!");
  }
};

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1890ff 0%, #001529 100%)",
      }}
    >
      <Card
        bordered={false}
        style={{
          width: 350,
          padding: "20px 30px",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Login
          </Title>
          <p style={{ color: "#888" }}>Acesse sua conta</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Usuário"
            rules={[{ required: true, message: "Por favor, insira seu usuário!" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              placeholder="Digite seu usuário"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Senha"
            rules={[{ required: true, message: "Por favor, insira sua senha!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="Digite sua senha"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Lembrar-me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{
                background: "#1890ff",
                borderRadius: 6,
                fontWeight: "bold",
                letterSpacing: 0.5,
              }}
            >
              Entrar
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <a href="#" style={{ color: "#1890ff" }} onClick={() => {alert('Entre em contato com o administrador para requisitar uma nova senha')}}>
              Esqueci minha senha
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
