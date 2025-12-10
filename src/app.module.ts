import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProductosModule } from './productos/productos.module';
import { DireccionesEnvioModule } from './direcciones-envio/direcciones-envio.module';
import { CarritoModule } from './carrito/carrito.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { MetodosEnvioModule } from './metodos-envio/metodos-envio.module';
import { ResenasModule } from './resenas/resenas.module';
import { ReportesModule } from './reportes/reportes.module';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Resena } from './resenas/entities/resena.entity';
import { VentaDiaria } from './reportes/entities/venta-diaria.entity';
import { Producto } from './productos/entities/productos.entity';
import { DetallePedido } from './pedidos/entities/detalle-pedido.entity';
import { HistorialEstadoPedido } from './pedidos/entities/historial-estado-pedido.entity';
import { Pedido } from './pedidos/entities/pedido.entity';
import { MetodoEnvio } from './metodos-envio/entities/metodo-envio.entity';
import { DireccionEnvio } from './direcciones-envio/entities/direccion-envio.entity';
import { Categoria } from './categorias/entities/categoria.entity';
import { CarritoItem } from './carrito/entities/carrito-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      username: process.env.DB_USERNAME || 'mysql',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Usuario, Resena, VentaDiaria, Producto, DetallePedido, HistorialEstadoPedido, Pedido, MetodoEnvio, DireccionEnvio, Categoria, CarritoItem],
      synchronize: true,
    }),
    AuthModule,
    UsuariosModule,
    CategoriasModule,
    ProductosModule,
    DireccionesEnvioModule,
    CarritoModule,
    PedidosModule,
    MetodosEnvioModule,
    ResenasModule,
    ReportesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
