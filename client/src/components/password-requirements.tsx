const PasswordRequirements = () => {
  return (
    <div className="text-muted-foreground text-sm space-y-2">
      <p>Password should contain:</p>
      <ul className="px-5 list-disc list-outside inline-block text-left">
        <li>Atleast one lower case character</li>
        <li>Atleast one upper case character</li>
        <li>Atleast one number</li>
        <li>Atleast one special character from {"!@#$%^&*(),.?:{}|<>"}</li>
        <li>5 to 20 characters</li>
      </ul>
    </div>
  );
};

export default PasswordRequirements;
