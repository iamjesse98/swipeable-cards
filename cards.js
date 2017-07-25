'use strict'

class Cards {
  constructor() {
    this.cards = document.querySelectorAll('.card')
    // rebind
    this.onStart = this.onStart.bind(this)
    this.onMove = this.onMove.bind(this)
    this.onEnd = this.onEnd.bind(this)
    this.update = this.update.bind(this)

    // Bounding Client Rect
    this.targetBCR = null

    this.draggingCard = false

    this.target = null

    // tracking positions
    this.startX = 0
    this.currentX = 0
    this.screenX = 0

    this.targetX = 0

    this.addEventListeners()

    requestAnimationFrame(this.update)
  }

  addEventListeners() {
    document.addEventListener('touchstart', this.onStart)
    document.addEventListener('touchmove', this.onMove)
    document.addEventListener('touchend', this.onEnd)

    document.addEventListener('mousedown', this.onStart)
    document.addEventListener('mousemove', this.onMove)
    document.addEventListener('mouseup', this.onEnd)
  }

  onStart(evt) {
    if(this.target) return
    //console.log('evt', evt)
    if(!evt.target.classList.contains('card')) return
    // console.log('card')
    this.target = evt.target

    this.targetBCR = this.target.getBoundingClientRect()

    this.startX = evt.pageX || evt.touches[0].pageX
    this.currentX =this.startX

    this.draggingCard = true

    this.target.style.willChange = 'transform'

    //evt.preventDefault()
  }

  onMove(evt) {
    if(!this.target) return
    this.currentX = evt.pageX || evt.touches[0].pageX
  }

  onEnd(evt) {
    if(!this.target) return

    this.targetX = 0
    let screenX = this.currentX - this.startX
    if(Math.abs(screenX) > this.targetBCR.width * 0.35) {
      this.targetX = (screenX > 0) ? this.targetBCR.width : -this.targetBCR.width
    } 

    this.draggingCard = false
  }
  // for RAF
  update() {
    requestAnimationFrame(this.update)

    if(!this.target) return

    if(this.draggingCard) {
      this.screenX = this.currentX - this.startX
    } else {
      this.screenX += (this.targetX - this.screenX) / 4
    }

    const normalizedDragDistance = (Math.abs(this.screenX) / this.targetBCR.width)

    const opacity = 1 - Math.pow(normalizedDragDistance, 3)

    this.target.style.opacity = opacity
    this.target.style.transform = `translateX(${this.screenX}px)`
    const isNearlyAtStart = (Math.abs(this.screenX) < 0.01)
    const isNearlyInvisible = (opacity < 0.01)

    if(!this.draggingCard){
      if(isNearlyInvisible) {

        let isAfterCurrentTarget = false
        Array.from(this.cards).forEach(card => {
          if(card === this.target) {
            isAfterCurrentTarget = true
            return
          }

          if(!isAfterCurrentTarget) return

          const onTransitionEnd = _ => {
            this.target = null
            card.style.transition = 'none'
            card.removeEventListener('transitionend', onTransitionEnd)
          }

          card.style.transform = `translateY(${this.targetBCR.height + 20}px)`
          requestAnimationFrame(_ => {
            card.style.transition = `transform .15s cubic-bezier(0, 0, .31, 1)`
            card.style.transform = 'none'
          })

          card.addEventListener('transitionend', onTransitionEnd)
        })

        if(this.target && this.target.parentNode) this.target.parentNode.removeChild(this.target)
        this.target = null
      }
      if(isNearlyAtStart) {
        this.target.style.willChange = 'initial'
        this.target.style.transform = 'none'
        this.target = null
      }
    }
  }
}

window.addEventListener('load', () => new Cards())
