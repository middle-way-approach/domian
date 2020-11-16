import Lib from '../src/domian'
import 'mutationobserver-shim'

let lib: Lib | null = null
// this is needed cause the mutationobserver-shim has a delay on reporting
const OBSERVER_DELAY = 50

const timeout = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const createElement = (className: string) => {
  const newElement = document.createElement('div')
  newElement.className = className
  return newElement
}

describe('Library', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="container"><div class="test" /></div>'
  })
  afterEach(() => {
    if (lib) {
      lib.destroy()
      lib = null
    }
  })

  it('triggers onMount on init', async () => {
    const onMount = jest.fn()
    lib = new Lib([{ name: 'test', onMount }])
    expect(onMount).toBeCalled()
  })

  it('triggers onMount after a node is appended', async () => {
    document.body.innerHTML = '<div id="container"></div>'
    const onMount = jest.fn()
    lib = new Lib([{ name: 'test', onMount }])
    const container = document.getElementById('container')
    if (container) {
      container.append(createElement('test'))
      await timeout(OBSERVER_DELAY)
      expect(onMount).toBeCalled()
      container.append(createElement('test'))
      await timeout(OBSERVER_DELAY)
      expect(onMount).toBeCalledTimes(2)
    }
  })

  it('triggers onUnMount on removing a node', async () => {
    const onUnMount = jest.fn()
    lib = new Lib([{ name: 'test', onUnMount }])
    expect(onUnMount).not.toBeCalled()
    const container = document.getElementById('container')
    if (container) {
      container.innerHTML = '<div></div>'
      await timeout(OBSERVER_DELAY)
      expect(onUnMount).toBeCalled()
    }
  })

  it('triggers onUpdate on changing props', async () => {
    const onUpdate = jest.fn()
    lib = new Lib([{ name: 'test', onUpdate }])
    expect(onUpdate).not.toBeCalled()
    const element = document.getElementsByClassName('test')[0]
    element.setAttribute('test', '1')
    await timeout(OBSERVER_DELAY)
    expect(onUpdate).toBeCalled()
  })

  it('triggers onUpdate on child change', async () => {
    const onUpdate = jest.fn()
    lib = new Lib([{ name: 'test', onUpdate }])
    expect(onUpdate).not.toBeCalled()
    const element = document.getElementsByClassName('test')[0]
    element.innerHTML = 'hello'
    await timeout(OBSERVER_DELAY)
    expect(onUpdate).toBeCalled()
  })

  it('it injects the correct instances', async () => {
    const element = document.getElementsByClassName('test')[0]
    const onMount = jest.fn()
    const onUpdate = jest.fn()
    const onUnMount = jest.fn()
    lib = new Lib([{ name: 'test', onMount, onUpdate, onUnMount }])
    expect(onMount).toHaveBeenCalledWith(element)
    expect(onUpdate).not.toHaveBeenCalled()
    expect(onUnMount).not.toHaveBeenCalled()
    element.setAttribute('test', '1')
    await timeout(OBSERVER_DELAY)
    expect(onUpdate).toHaveBeenCalledWith(element)
    const container = document.getElementById('container')
    if (container) {
      container.innerHTML = '<div></div>'
      await timeout(OBSERVER_DELAY)
      expect(onUnMount).toBeCalledWith(element)
    }
  })

  it('changes the DOM on mount', async () => {})
})
