interface Component {
  name: string
  onMount?: (node: Element) => void
  onUpdate?: (node: Element) => void
  onUnMount?: (node: Element) => void
}

export default class Domian {
  private registeredComponents: Map<string, Component>
  // TODO do we need a Set to hold the references of the nodes?
  // private mountedNodes: Set<Node>
  private observer: MutationObserver

  constructor(components: Array<Component>) {
    this.registeredComponents = new Map<string, Component>()
    this.observer = new MutationObserver(this.onDomMutation)
    components.forEach(component => {
      this.registeredComponents.set(component.name, component)
    })
    this.initializeElements()
    this.initializeObserver()
  }

  /**
   * Searches all Nodes with a classname corresponding to the names of the
   * registered elements, triggers their onMount function and stores them
   * under the mounted notes
   */
  private initializeElements() {
    this.registeredComponents.forEach((component, key) => {
      const elements = Array.from(document.getElementsByClassName(key))
      elements.forEach(element => {
        if (component.onMount) {
          component.onMount(element)
        }
      })
    })
  }

  public destroy() {
    this.observer.disconnect()
  }

  private initializeObserver() {
    this.observer.observe(document.body, { childList: true, subtree: true, attributes: true })
  }

  /**
   * This is called by the Mutation observer if a mutation was detected
   * There are 2 types handled:
   *   'attributes'
   *     When an attribute of an element changed
   *     This will always trigger an update of the target
   *   'childList'
   *     This will trigger the onUpdate of the parent if it is registered
   *     as a component and a children got removed, added or changed.
   *     This will trigger the onMount if a new element was added that
   *     is registered as a component.
   *     This will trigger an the unMount if a element was removed
   *     that is registered as a component.
   *
   * @param mutations
   */
  private onDomMutation = (mutations: MutationRecord[]) => {
    mutations.forEach(mutation => {
      const { target, type, addedNodes, removedNodes } = mutation
      if (type === 'attributes' && target instanceof Element) {
        const { className } = target
        const component = this.registeredComponents.get(className)
        if (component && component.onUpdate) {
          component.onUpdate(target)
        }
      }
      if (type === 'childList') {
        if (target instanceof Element) {
          const { className } = target
          const component = this.registeredComponents.get(className)
          if (component && component.onUpdate) {
            component.onUpdate(target)
          }
        }
        addedNodes.forEach(node => {
          if (node instanceof Element) {
            // TODO is this check necessary? If a node gets added it can't be in mounted nodes!?
            const { className } = node
            const component = this.registeredComponents.get(className)
            if (component && component.onMount) {
              component.onMount(node)
            }
          }
        })
        removedNodes.forEach(node => {
          if (node instanceof Element) {
            const { className } = node
            const component = this.registeredComponents.get(className)
            if (component && component.onUnMount) {
              component.onUnMount(node)
            }
          }
        })
      }
    })
  }
}
