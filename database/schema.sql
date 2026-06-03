-- Tabela de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    endereco TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco_sugerido DECIMAL(10,2),
    tempo_estimado_minutos INT
);

-- Tabela de ordens de servi?o (os)
CREATE TABLE os (
    id SERIAL PRIMARY KEY,
    numero_os VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT REFERENCES clientes(id) ON DELETE CASCADE,
    categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
    equipamento VARCHAR(100),
    modelo VARCHAR(100),
    imei VARCHAR(50),
    defeito TEXT,
    servico_realizado TEXT,
    tipo_atendimento VARCHAR(20) CHECK (tipo_atendimento IN ('presencial', 'remoto')) DEFAULT 'presencial',
    inicio_real TIMESTAMP,
    pausado_em TIMESTAMP,
    tempo_acumulado_segundos INT DEFAULT 0,
    status_tempo VARCHAR(20) CHECK (status_tempo IN ('nao_iniciado', 'em_andamento', 'pausado', 'finalizado')) DEFAULT 'nao_iniciado',
    estimativa_horas DECIMAL(5,2),
    preco_final DECIMAL(10,2),
    status_os VARCHAR(20) CHECK (status_os IN ('aberto', 'analise', 'aguardando_peca', 'concluido', 'entregue')) DEFAULT 'aberto',
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_conclusao DATE,
    data_entrega DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de fotos
CREATE TABLE fotos_os (
    id SERIAL PRIMARY KEY,
    os_id INT REFERENCES os(id) ON DELETE CASCADE,
    caminho_arquivo VARCHAR(255) NOT NULL,
    nome_original VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ?ndices
CREATE INDEX idx_os_cliente ON os(cliente_id);
CREATE INDEX idx_os_data_conclusao ON os(data_conclusao);
CREATE INDEX idx_os_categoria ON os(categoria_id);
CREATE INDEX idx_os_numero ON os(numero_os);

-- Inserir categorias padr?o
INSERT INTO categorias (nome, preco_sugerido, tempo_estimado_minutos) VALUES
('Formata??o e instala??o', 120.00, 90),
('Remo??o de v?rus', 80.00, 60),
('Troca de tela (celular)', 250.00, 60),
('Troca de bateria (celular)', 150.00, 40),
('Reparo em placa (celular)', 300.00, 120),
('Manuten??o de PC (hardware)', 180.00, 90);
