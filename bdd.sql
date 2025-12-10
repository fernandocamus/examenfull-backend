INSERT INTO usuarios (nombre, correo, contrasena, rol, telefono) VALUES
('Admin Principal', 'admin@tienda.com', '123456', 'ADMIN', '+56911112222'),
('Cliente Juan', 'juan@correo.com', '123456', 'CLIENTE', '+56987654321'),
('Cliente Maria', 'maria@correo.com', '123456', 'CLIENTE', '+56999887766');

INSERT INTO categorias (nombre, descripcion, activo, orden) VALUES
('Electrónica', 'Productos tecnológicos como laptops, tablets, teléfonos y accesorios.', 1, 1),
('Hogar Inteligente', 'Equipos IoT, smart plugs, iluminación inteligente y automatización.', 1, 2),
('Gaming', 'Periféricos, accesorios y hardware para gamers.', 1, 3),
('Audio y Sonido', 'Audífonos, parlantes, micrófonos y equipos de sonido.', 1, 4),
('Accesorios de Computación', 'Mouse, teclados, pads, soportes y accesorios varios.', 1, 5);

INSERT INTO productos (nombre, descripcion, precio_base, iva, precio_con_iva, stock_actual, stock_minimo, categoria_id, rutaImagen, activo) VALUES
-- 1 Electrónica
('Smartphone Samsung A54', 'Pantalla 6.4", 256GB, 8GB RAM', 320000, 19, 380800, 12, 5, 1, 'https://ejemplo.com/a54.jpg', 1),
('Tablet Lenovo M10', 'Tablet 10" con 4GB RAM y 64GB almacenamiento', 150000, 19, 178500, 20, 5, 1, 'https://ejemplo.com/m10.jpg', 1),
-- 2 Hogar Inteligente
('Smart Plug TP-Link Tapo', 'Enchufe inteligente compatible con Alexa y Google Home', 18000, 19, 21420, 25, 5, 2, 'https://ejemplo.com/tapo.jpg', 1),
('Bombilla Inteligente Philips Hue', 'Bombilla LED RGB compatible con app móvil', 25000, 19, 29750, 18, 5, 2, 'https://ejemplo.com/hue.jpg', 1),
-- 3 Gaming
('Teclado Redragon Kumara K552', 'Teclado mecánico switches Red', 32000, 19, 38080, 15, 5, 3, 'https://ejemplo.com/kumara.jpg', 1),
('Mouse Logitech G502', 'Mouse gamer 25K HERO', 45000, 19, 53550, 30, 5, 3, 'https://ejemplo.com/g502.jpg', 1),
-- 4 Audio y Sonido
('Audífonos Sony WH-CH520', 'Bluetooth, batería larga duración', 45000, 19, 53550, 10, 5, 4, 'https://ejemplo.com/ch520.jpg', 1),
('Parlante JBL Flip 6', 'Resistente al agua, sonido potente', 90000, 19, 107100, 8, 5, 4, 'https://ejemplo.com/flip6.jpg', 1),
-- 5 Accesorios de Computación
('Mouse Pad Grande RGB', 'Alfombrilla gamer con iluminación RGB', 18000, 19, 21420, 40, 5, 5, 'https://ejemplo.com/mousepad.jpg', 1),
('Soporte Ajustable para Laptop', 'Soporte metálico para laptop de 10 a 17 pulgadas', 20000, 19, 23800, 22, 5, 5, 'https://ejemplo.com/soporte.jpg', 1);

INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES
-- Carrito de Juan (usuario 2)
(2, 1, 1),   -- Smartphone
(2, 6, 1),   -- Mouse G502
(2, 10, 2),  -- Mouse pad RGB
-- Carrito de Maria (usuario 3)
(3, 3, 1),   -- Smart plug Tapo
(3, 4, 2),   -- Bombilla Philips Hue
(3, 8, 1);   -- Parlante JBL Flip 6

INSERT INTO metodos_envio (nombre, descripcion, costo, tiempo_estimado, activo) VALUES
('Envío Estándar', 'Entrega entre 3 a 5 días hábiles.', 3990, '3-5 días hábiles', 1),
('Envío Express', 'Entrega rápida dentro de 24-48 horas.', 7990, '1-2 días hábiles', 1),
('Retiro en Tienda', 'Retiro presencial sin costo.', 0, 'Disponible desde el mismo día', 1),
('Envío Programado', 'Entrega en un horario específico elegido por el cliente.', 4990, '2-4 días hábiles', 1),
('Envío Económico', 'Opción de envío de bajo costo con mayor tiempo de espera.', 1990, '5-8 días hábiles', 1);

INSERT INTO pedidos (numero_pedido, estado, subtotal, total_iva, costo_envio, total, metodo_pago, notas_cliente, notas_admin, fecha_confirmacion, fecha_envio, fecha_entrega, numero_seguimiento, nombre_destinatario, telefono, direccion, ciudad, region, usuario_id) VALUES
-- Pedido 1: Juan
('PED-0001', 'PENDIENTE', 365000, 69400, 3990, 438390, 'TARJETA', 'Por favor entregar en conserjería.', NULL, NULL, NULL, NULL, NULL,
'Juan Perez', '+56987654321', 'Calle Uno 123', 'Santiago', 'Región Metropolitana', 2),
-- Pedido 2: Maria
('PED-0002', 'CONFIRMADO', 18000, 3420, 0, 21420, 'TRANSFERENCIA', NULL, NULL, NOW(), NULL, NULL, NULL,
'Maria Gonzalez', '+56999887766', 'Avenida Central 550', 'Santiago', 'Región Metropolitana', 3),
-- Pedido 3: Maria
('PED-0003', 'ENVIADO', 110000, 20900, 0, 130900, 'TARJETA', 'Por favor llamar antes de entregar.', NULL, NOW(), NOW(), NULL, 'SEG123456789',
'Maria Gonzalez', '+56999887766', 'Avenida Central 550', 'Santiago', 'Región Metropolitana', 3);

INSERT INTO ventas_diarias (fecha, cantidad_pedidos, total_vendido, total_productos_vendidos, producto_mas_vendido_id, promedio_ticket, pedidos_pendientes, pedidos_completados) VALUES
('2025-12-20', 1, 438390, 2, 1, 438390, 1, 0),
('2025-12-21', 1, 21420, 1, 3, 21420, 0, 1),
('2025-12-22', 1, 130900, 2, 8, 130900, 0, 1);

INSERT INTO resenas (producto_id, usuario_id, pedido_id, calificacion, comentario) VALUES
-- Juan compró los productos 1 y 6 en el Pedido 1
(1, 2, 1, 5, 'Excelente smartphone, funciona rápido y la batería dura bastante.'),
(6, 2, 1, 4, 'Muy buen mouse, cómodo y preciso, aunque un poco pesado.'),
-- María compró el producto 3 en el Pedido 2
(3, 3, 2, 5, 'El smart plug es muy práctico, fácil de conectar y controlar.'),
-- María compró los productos 8 y 10 en el Pedido 3
(8, 3, 3, 5, 'El sonido del parlante JBL es increíble, vale totalmente la pena.'),
(10, 3, 3, 4, 'Buen soporte para laptop, firme y estable, aunque podría ser más ajustable.');

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario_base, iva, precio_unitario_con_iva, subtotal_sin_iva, subtotal_iva, subtotal_con_iva) VALUES
-- Pedido 1 - Juan
(1, 1, 1, 220000, 19, 261800, 220000, 41800, 261800),
(1, 6, 1, 32000, 19, 38080, 32000, 6080, 38080),
-- Pedido 2 - María
(2, 3, 1, 9000, 19, 10710, 9000, 1710, 10710),
-- Pedido 3 - María
(3, 8, 1, 95000, 19, 113050, 95000, 18050, 113050),
(3, 10, 1, 18000, 19, 21420, 18000, 3420, 21420);

INSERT INTO historial_estado_pedidos (pedido_id, estado_anterior, estado_nuevo, usuario_id, comentario) VALUES
-- Pedido 1 (Juan)
(1, NULL, 'PENDIENTE', 2, 'Pedido creado por el usuario.'),
(1, 'PENDIENTE', 'CONFIRMADO', 1, 'Administrador confirmó el pedido.'),
(1, 'CONFIRMADO', 'ENVIADO', 1, 'Pedido enviado al cliente.'),
(1, 'ENVIADO', 'COMPLETADO', 1, 'Pedido entregado y marcado como completado.'),
-- Pedido 2 (María)
(2, NULL, 'PENDIENTE', 3, 'Pedido generado por la usuaria.'),
(2, 'PENDIENTE', 'CONFIRMADO', 1, 'Administrador verificó y confirmó el pedido.'),
(2, 'CONFIRMADO', 'ENVIADO', 1, 'Pedido despachado al cliente.'),
-- Pedido 3 (María)
(3, NULL, 'PENDIENTE', 3, 'Pedido ingresado por la usuaria.'),
(3, 'PENDIENTE', 'CONFIRMADO', 1, 'Administrador confirmó el pedido.'),
(3, 'CONFIRMADO', 'ENVIADO', 1, 'Pedido enviado al domicilio de la clienta.'),
(3, 'ENVIADO', 'ENTREGADO', 1, 'Cliente recibió el pedido exitosamente.');
