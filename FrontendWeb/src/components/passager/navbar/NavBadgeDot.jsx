// Petit badge de notification réutilisé sur les 3 formats (mobile/tablette/desktop).
// count > 0 => pastille numérotée (ou point si trop grand pour un chiffre) ; sinon rien.
const NavBadgeDot = ({ count, className = '' }) => {
  if (!count) return null;

  return (
    <span
      className={`absolute flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none ${className}`}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
};

export default NavBadgeDot;
