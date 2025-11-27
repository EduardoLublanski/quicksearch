package com.nunescarneiroadvogados.quicksearch.domain.entity.processo

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "prazo")
data class Prazo(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    var assunto: String = "",

    @Column(name = "data_hora")
    var dataHora: LocalDateTime = LocalDateTime.now(),

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "processo_id")
    var processo: Processo? = null
)
