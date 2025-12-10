export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'tu_secreto_super_seguro_y_muy_largo_aqui_123456789',
  expiresIn: parseInt(process.env.JWT_EXPIRES || '86400', 10),
};


