const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

// RETORNA TODOS AS EMPRESAS
router.get('/',(req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM empresas;',
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    total_empresas: result.length,
                    empresas: result.map(empresa => {
                        return {
                            id_empresa: empresa.id_empresa,
                            nome: empresa.nome,
                            preco: empresa.preco,
                            request: {
                                tipo: 'GET',
                                descrição: 'Retorna os detalhes de uma empresa específica',
                                url: 'http://localhost:3000/empresas/' + empresa.id_empresas
                            }
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    });
});

// INSERE EMPRESA
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'INSERT INTO empresas (nome) VALUES (?)',
            [req.body.nome],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Empresa inserida com sucesso',
                    EmpresaCriada: {
                        id_empresa: result.id_empresa,
                        nome: req.body.nome,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todas as empresas',
                            url: 'http://localhost:3000/empresas'
                        }    
                    }
                }
                return res.status(201).send(response);
            }
        )
    });
    
});

// RETORNA OS DADOS DE UMA EMPRESA
router.get('/:id_empresa', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM empresa WHERE id_empresa = ?;',
            [req.params.id_empresa],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }

                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado empresa com este ID'
                    })
                }
                const response = {
                    empresa: {
                        id_empresa: result[0].id_empresa,
                        nome: result[0].nome,                        
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos as empresas',
                            url: 'http://localhost:3000/empresas'
                        }    
                    }
                }
                return res.status(200).send(response);
            }
        )
    });
});

// ALTERA EMPRESA
router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `UPDATE empresas
                SET nome        = ?                    
               WHERE id_empresa  = ?`,
            [
                req.body.nome,
                req.body.id_empresa
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Empresa atualizada com sucesso',
                    empresaCriado: {
                        id_empresa: result.id_empresa,
                        nome: req.body.nome,
                        request: {
                            tipo: 'GET',
                            descrição: 'Retorna os detalhes de um empresa específica',
                            url: 'http://localhost:3000/empresas/' + req.body.id_empresa
                        }
                    }
                }
                return res.status(202).send(response);
                
            }
        )
    });
});

// EXCLUI EMPRESA
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `DELETE FROM empresas WHERE id_empresa  = ?`, [req.body.id_empresa],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'empresa removido com sucesso',
                    request: {
                        tipo: 'POST',
                        descricao: 'Insere uma empresa',
                        url: 'http://localhost:3000/empresas',
                        body: {
                            nome: 'String'
                        }
                    }
                }
                return res.status(202).send(response);
            }
        )
    });
});

module.exports = router;