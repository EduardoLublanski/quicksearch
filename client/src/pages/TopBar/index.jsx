import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  UserAddOutlined,
  TeamOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../services/authContex.js";

const { Header } = Layout;

const TopBar = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');

  const { roles, logout, username, token } = useAuth();
  const isADM = roles.includes("ROLE_ADMIN");

  const menuItems = [
  {
    key: "cliente",
    icon: <UserAddOutlined />,
    label: "Clientes",
  },
  {
    key: "advogado",
    icon: <TeamOutlined />,
    label: "Advogados",
  },
  {
    key: "processos",
    icon: <FileTextOutlined />,
    label: "Processos",
  },
  {
    key: "usuario",
    icon: <TeamOutlined />,
    label: "Usuário",
    disabled: !isADM, // 👈 fica visível, mas não clicável
  },
];


  const onClick = (e) => {
    setCurrent(e.key);
    navigate(`/${e.key}`);
  };

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        padding: '0 24px',
      }}
    >
      {/* Menu centralizado */}
      <div style={{ flex: 1 }}>
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={menuItems}
          style={{ borderBottom: 'none', justifyContent: 'center' }}
        />
      </div>

      {/* Username + Logout no canto direito */}
     {token && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span>{username}</span>
    <Button
      type="primary"
      danger
      icon={<LogoutOutlined />}
      onClick={() => {
        logout();
        navigate('/');
      }}
    >
      Sair
    </Button>
  </div>
)}

    </Header>
  );
};

export default TopBar;
