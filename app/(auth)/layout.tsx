type Props = {
  children: React.ReactNode;
};

const AuthLayout = (props: Props) => {
  return <div>{props.children}</div>;
};

export default AuthLayout;
