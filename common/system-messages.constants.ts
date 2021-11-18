export enum SystemMessages {
    DebugOff = 'Affichage du débogage désactivé',
    DebugOn = 'Affichage du débogage activé',
    HelpMessage = `!placer <rangée><colonne><direction: h ou v> <mot>: permet de placer un mot aux coordonnées spécifiées\n!aide: permet d'afficher ce dialogue\n!debug: permet d'aficher davantage de messages sur l'exécution de la partie\n!réserve: affiche la quantité restantes de chaque lettre\n!échanger <lettre>: permet d'échanger une lettre de votre rchevalet pour une lettre pigée aléatoirement\n`,
    HelpTitle = "Capsule d'aide - Commandes disponibles",
    InvalidCommand = 'Entrée invalide',
    InvalidFormat = 'Erreur de syntaxe',
    ImpossibleCommand = 'Commande impossible à réaliser',
    ValidSyntax = 'La syntaxe est valide',
    ValidCommand = 'La commande est valide',
    InvalidLetters = 'Vous n\'avez pas saisi des lettres',
    InvalidOptions = 'Options fournies invalides',
    InvalidTurn = "Ce n'est pas à votre tour... Patience",
    InvalidUserMessage = 'Format du message invalide',
    InvalidWord = 'Vous devez saisir un mot',
    NotEnoughLetters = "Il n'y a pas suffisamment de lettres dans votre chevalet",
    LetterPossessionError = 'Vous ne possédez pas la lettre :',
    EmptyReserveError = 'La réserve est vide, donc vous ne pouvez plus piger de lettres',
    ReserveContentTitle = 'Contenu de la réserve:',
}
