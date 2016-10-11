// Custom extensions
export default (H) => {
  H.wrap(H.Pointer.prototype, 'reset', (proceed, allowMove, delay) => {
    if (this.options && this.options.tooltip && (this.options.tooltip.reset === false)) return undefined

    // Apply the original function with the original arguments,
    // which are sliced off this function's arguments
    proceed.apply(this, Array.prototype.slice.call(arguments, 1))
  })
}
