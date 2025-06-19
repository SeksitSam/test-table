"use client";

import { Table, Button, Modal, Form, Input, Space, Select, Skeleton } from "antd";
import { useState, useEffect } from "react";

interface User {
  id?: number;
  name: string;
  type: string;
  code: string;
}


export default function Home() {
  const [form] = Form.useForm();
  const [data, setData] = useState<User[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);


  const [loading, setLoading] = useState(true); // ⬅ เพิ่ม loading state

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/users")
      .then(res => res.json())
      .then(data => setData(data))
      .finally(() => setLoading(false)); // ⬅ เมื่อโหลดเสร็จ
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (record?: User) => {
    setEditingUser(record || null);
    form.setFieldsValue(record || { name: "", type: "", code: "" });
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // UPDATE
        await fetch(`http://localhost:5000/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        // CREATE
        await fetch("http://localhost:5000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }

      // ดึงข้อมูลใหม่หลังจากเพิ่ม/แก้ไข
      const res = await fetch("http://localhost:5000/users");
      const updatedData = await res.json();
      setData(updatedData);

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Submit Error:", error);
    }
  };


  const openDeleteModal = (user: User) => {
    setDeleteUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteUser?.id) return;

    try {
      await fetch(`http://localhost:5000/users/${deleteUser.id}`, {
        method: "DELETE",
      });
      const res = await fetch("http://localhost:5000/users");
      const updatedData = await res.json();
      setData(updatedData);
    } catch (error) {
      console.error("Delete Error:", error);
    }

    setIsDeleteModalOpen(false);
    setDeleteUser(null);
  };
  const columns = [
    {
      title: "ชื่อ",
      dataIndex: "name",
      key: "name",
      onHeaderCell: () => ({
        style: { backgroundColor: "#6699FF", color: "#000", fontWeight: "bold" },
      }),
    },
    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
      onHeaderCell: () => ({
        style: { backgroundColor: "#6699FF", color: "#000", fontWeight: "bold" },
      }),
    },
    {
      title: "รหัส",
      dataIndex: "code",
      key: "code",
      onHeaderCell: () => ({
        style: { backgroundColor: "#6699FF", color: "#000", fontWeight: "bold" },
      }),
    },
    {
      title: "การจัดการ",
      key: "actions",
      onHeaderCell: () => ({
        style: { backgroundColor: "#6699FF", color: "#000", fontWeight: "bold" },
      }),
      render: (_: any, record: User) => (
        <Space>
          <Button onClick={() => showModal(record)}>แก้ไข</Button>
          <Button danger onClick={() => openDeleteModal(record)}>ลบ</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontWeight: "bold", fontSize: "2rem", marginBottom: 16 }}>
        จัดการผู้ใช้
      </h1>
      <div style={{ display: "flex", justifyContent: "flex-strat", marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal()}>
          เพิ่มผู้ใช้
        </Button>
      </div>
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table
          rowKey="id"
          dataSource={data}
          columns={columns}
          style={{
            border: "1px solid #ddd",      // กรอบบางๆ สีเทาอ่อน
            borderRadius: 8,                // มุมโค้งมน
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // เงานูนอ่อน
            overflow: "hidden",            // ซ่อน overflow เผื่อมุมโค้ง
          }}
        />
      )}
      <Modal
        title={editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="ชื่อ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="ประเภท" rules={[{ required: true }]}>
            <Select placeholder="เลือกประเภทผู้ใช้">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="employee">Employee</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="code" label="รหัส" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalOpen}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="ลบ"
        okType="danger"
        cancelText="ยกเลิก"
      >
        <p>
          คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้{" "}
          <strong>{deleteUser?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
