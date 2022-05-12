const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

// RETORNA VAGAS
router.get('/',(req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { console.log(error) 
            return res.status(500).send({ error: error }) }
        conn.query(`SELECT vagas.id_vaga,    
                            vagas.titulo,
                            vagas.salario,
                            vagas.descricao,
                            empresas.id_empresa,
                            empresas.nome                          
                        FROM vagas
                    INNER JOIN empresas
                            ON empresas.id_empresa = vagas.id_empresa;`,
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    total_vagas: result.length,
                    vagas: result.map(vaga => {
                        return {
                            id_vaga: vaga.id_vaga,
                            titulo: vaga.titulo,
                            empresa: {
                                id_empresa: vaga.id_empresa,
                                titulo: vaga.titulo,
                                salario: vaga.salario,
                                descricao: vaga.descricao
                            },  
                            request: {
                                tipo: 'GET',
                                descrição: 'Retorna os detalhes de uma vaga específica',
                                url: 'http://localhost:3000/vagas/' + vaga.id_vaga
                            }
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    });
});
// INSERE VAGA
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query('SELECT * FROM empresas WHERE id_empresa = ?',
        [req.body.id_empresa],
        (error, result, field) => {
            if (error) { return res.status(500).send({ error: error }) }
            if (result.length == 0) {
                return res.status(404).send({
                    mensagem: 'Empresa não encontrada'
                })
            }
            conn.query(
                'INSERT INTO vagas (id_empresa, titulo, salario, descricao) VALUES (?,?,?,?)',
                [req.body.id_empresa, req.body.titulo, req.body.salario, req.body.descricao],
                (error, result, field) => {
                    conn.release();
                    if (error) { return res.status(500).send({ error: error }) }
                    const response = {
                        mensagem: 'Vaga inserida com sucesso',
                        vagaCriada: {
                            id_vaga: result.id_vaga,
                            id_empresa: req.body.id_empresa,
                            titulo: req.body.titulo,
                            salario: req.body.salario,
                            descricao: req.body.descricao,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna todas as vagas',
                                url: 'http://localhost:3000/vagas'
                            }    
                        }
                    }
                    return res.status(201).send(response);
                }
            )
        });
    })
});

// RETORNA UMA VAGA
router.get('/:id_vaga', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            'SELECT * FROM vagas WHERE id_vaga = (?);',
            [req.params.id_vaga],
            (error, result, fields) => {
                if (error) { return res.status(500).send({ error: error }) }

                if (result.length == 0) {
                    return res.status(404).send({
                        mensagem: 'Não foi encontrada vaga com este ID'
                    })
                }
                const response = {
                    vaga : {
                        id_vaga : result[0].id_vaga ,
                        id_empresa: result[0].id_empresa,
                        titulo: result[0].titulo,
                        salario: result[0].salario,
                        descricao: result[0].descricao,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todas as vagas',
                            url: 'http://localhost:3000/vagas'
                        }    
                    }
                }
                return res.status(200).send(response);
            }
        )
    });
});

// ALTERA UMA VAGA
router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `UPDATE vagas
                SET titulo        = (?),
                    salario     = (?),
                    descricao   = (?)                    
               WHERE id_vaga  = (?)`,
            [
                req.body.titulo,
                req.body.salario,
                req.body.descricao,
                req.body.id_vaga
            ],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Vaga atualizada com sucesso',
                    vagaCriada: {
                        id_vaga: result.id_vaga,
                        titulo: req.body.titulo,
                        salario: req.body.salario,
                        descricao: req.body.descricao,
                        request: {
                            tipo: 'GET',
                            descrição: 'Retorna os detalhes de um vaga específica',
                            url: 'http://localhost:3000/vagas/' + req.body.id_vaga
                        }
                    }
                }
                return res.status(202).send(response);
                
            }
        )
    });
});

// EXCLUI VAGA
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(
            `DELETE FROM vagas WHERE id_vaga   = ?`, [req.body.id_vaga],
            (error, result, field) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                const response = {
                    mensagem: 'Vaga removida com sucesso',
                    request: {
                        tipo: 'POST',
                        descricao: 'Insere uma vaga ',
                        url: 'http://localhost:3000/vaga',
                        body: {
                            id_vaga: 'Number'
                        }
                    }
                }
                return res.status(202).send(response);
            }
        )
    });
});

module.exports = router;