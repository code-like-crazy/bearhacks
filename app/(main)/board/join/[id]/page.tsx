type Props = {
  params: Promise<{ id: string }>;
};

const JoinBoardPage = async (props: Props) => {
  const { id } = await props.params;

  return <div>JoinBoardPage</div>;
};

export default JoinBoardPage;
