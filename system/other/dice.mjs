export default class UtopiaDiceTerm extends DiceTerm {
  constructor({number=1, faces=6, method, modifiers=[], results=[], options={}}) {
    super({options});

    this._number = number;
    this._faces = faces;
    this.method = method;
    this.modifiers = modifiers;
    this.results = results;

    // If results were explicitly passed, the term has already been evaluated
    if ( results.length ) this._evaluated = true;
  }

  
}