document.addEventListener('DOMContentLoaded', () => {
    const formPedido = document.getElementById('formPedido')
    const campoNome = document.getElementById('nome')
    const campoItens = document.getElementById('itens')
    const toastContainer = document.getElementById('toastContainer')
    const linkPedido = document.querySelector('.navbar-nav .nav-link[href="#pedido"]')

    // carrinho: nome do produto -> {quantidade, preco}
    const carrinho = new Map()

  function parsePreco(textoPreco) {
    const numero = textoPreco
      .replace('R$', '')
      .trim()
      .replace(/\./g, '')
      .replace(',', '.');
    return Number(numero) || 0;
  }

  function formatarMoeda(valor) {
    return valor.toFixed(2).replace('.', ',')
  }

  function atualizarTextareaItens() {
    if (carrinho.size === 0) {
      campoItens.value = '';
      return;
    }

    const linhas = []
    let total = 0

    carrinho.forEach(({ quantidade, preco }, nome) => {
        const subtotal = quantidade * preco
        total += subtotal
        linhas.push(`${quantidade}x ${nome} — R$ ${formatarMoeda(subtotal)}`)
    })

    linhas.push('', `Total: R$ ${formatarMoeda(total)}`)
    campoItens.value = linhas.join('\n')
    }

    function atualizarContadorNavbar() {
        if (!linkPedido) return

        let totalItens = 0
        carrinho.forEach(({ quantidade }) => {
            totalItens += quantidade
        })

        let contador = linkPedido.querySelector('.contador-carrinho')

        if (totalItens === 0) {
            if (contador) contador.remove()
                return
        }

        if (!contador) {
            contador = document.createElement('span')
            contador.className = 'contador-carrinho'
            linkPedido.appendChild(contador)
        }

        contador.textContent = totalItens
    }

    function adicionarAoCarrinho(botao) {
        const nome = botao.dataset.nome
        const card = botao.closest('.card')
        const textoPreco = card ? card.querySelector('.fs-5')?.textContent ?? '0' : '0'
        const preco = parsePreco(textoPreco)

        const itemAtual = carrinho.get(nome) ?? { quantidade: 0, preco }
        itemAtual.quantidade += 1
        carrinho.set(nome, itemAtual)

        atualizarTextareaItens()
        atualizarContadorNavbar()
        darFeedbackVisual(botao)
    }

    function darFeedbackVisual(botao) {
        const textoOriginal = botao.textContent
        botao.textContent = 'Adicionado'
        botao.disabled = false

        window.setTimeout(() => {
            botao.textContent = textoOriginal
            botao.disabled = false
        }, 900)
    }

    document.querySelectorAll('.add-to-cart').forEach((botao) => {
        botao.addEventListener('click', () => adicionarAoCarrinho(botao))
    })

  function exibirToastConfirmacao(nomeCliente) {
    if (!toastContainer || typeof bootstrap === 'undefined') {
      window.alert(`Obrigado, ${nomeCliente}! Recebemos seu pedido.`);
      return;
    }

    const toastEl = document.createElement('div')
    toastEl.className = 'toast text-bg-dark align-items-center border-0'
    toastEl.setAttribute('role', 'alert')
    toastEl.setAttribute('aria-live', 'assertive')
    toastEl.setAttribute('aria-atomic', 'true')
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class=toast-body">
                Obrigado, ${nomeCliente}! Recebemos seu pedido e em breve entraremos em contato.
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
        </div>
    `
    
    toastContainer.appendChild(toastEl)

    const toast = new bootstrap.Toast(toastEl, { delay: 5000 })
    toast.addEventListener('hidden.bs.toast', () => toastEl.remove())
    toast.show()
  }

  formPedido.addEventListener('submit', (evento) => {
    evento.preventDefault()

    if(!formPedido.checkVisibility()) {
        evento.stopPropagation()
        formPedido.classList.remove('was-validated')
        return
    }

    const nomeCliente = campoNome.value.trim()
    exibirToastConfirmacao(nomeCliente)

    formPedido.reset()
    formPedido.classList.remove('was-validated')
    carrinho.clear()
    atualizarContadorNavbar()
  })
})