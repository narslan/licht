enum TokenType {
   Move = 'Move',
   NullMove = 'NullMove', 
   EscapeComment = 'EscapeComment', 
   MoveAnnotation = 'MoveAnnotation',
   Result = 'Result',
   Commentary = 'Commentary',
   TagSymbol = 'TagSymbol',
   TagString = 'TagString'
}

export function tokenize (input: string): Token[] {
  const out: Token[] = []
  let currentPosition = 0

  return out
}

export default tokenize
