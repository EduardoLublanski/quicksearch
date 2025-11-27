package com.nunescarneiroadvogados.quicksearch.domain.entity.processo

import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.annotation.JsonNaming
import com.nunescarneiroadvogados.quicksearch.domain.entity.Advogado
import com.nunescarneiroadvogados.quicksearch.domain.entity.Cliente
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.LocalDate

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy::class)
@Entity
@Table(name = "processo")
data class Processo(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    @Column(unique = true, nullable = false)
    var numero: String = "",

    @Column(name = "data_abertura")
    var dataAbertura: LocalDate? = null,

    @Column(name = "data_encerramento")
    var dataEncerramento: LocalDate? = null,

    var status: String = "",
    var descricao: String = "",
    var tipo: String = "",
    var vara: String = "",

    @Column(name = "valor_causa")
    var valorCausa: Double = 0.0,

    @ManyToOne
    @JoinColumn(name = "advogado_id")
    var advogadoResponsavel: Advogado? = null,

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    var cliente: Cliente? = null,

    var localizacao: String = "",

    @OneToMany(mappedBy = "processo",
        fetch = FetchType.LAZY,  // MUDE PARA LAZY
        cascade = [CascadeType.ALL],
        orphanRemoval = true)
    var documentosPendentes: MutableList<Documento> = mutableListOf(),

    @OneToMany(mappedBy = "processo",
        fetch = FetchType.LAZY,  // MUDE PARA LAZY
        cascade = [CascadeType.ALL],
        orphanRemoval = true)
    var prazosProcessuais: MutableList<Prazo> = mutableListOf()
)