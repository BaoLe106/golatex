import ContainerLayout from "@/components/ContainerLayout";
import { Separator } from "@/components/ui/separator";

const AboutView: React.FC = () => {
  return (
    <ContainerLayout className="w-full">
      <div className="w-2/3 flex mt-12 mb-6">
        <p className="font-medium text-3xl">About Doclean</p>
      </div>
      <div className="w-2/3 flex flex-col">
        <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc velit
          dolor, mollis ultrices lorem laoreet, imperdiet interdum ex. Sed id
          posuere justo. Nullam consequat condimentum nisi, in mattis leo
          aliquet mattis. Nam hendrerit purus in dignissim eleifend. Ut mollis
          metus a ullamcorper mollis. Proin tempor, lorem id auctor suscipit,
          lorem ex hendrerit arcu, ut ultricies purus sapien in metus. Quisque
          rutrum tellus a molestie tempor. Praesent id tempor nibh. Nam auctor
          velit et suscipit tincidunt.
        </p>
        <p className="text-xl text-zinc-500 dark:text-zinc-400 ">
          Proin ac sapien consectetur, viverra quam a, posuere lectus. Mauris at
          efficitur risus. Aenean dui lorem, ultricies at libero vitae, auctor
          mattis massa. Maecenas hendrerit ante ut porttitor venenatis. Morbi
          sit amet aliquam mauris. Cras elementum, erat molestie mattis rhoncus,
          massa arcu venenatis tellus, sit amet placerat urna mauris a ligula.
          Nullam ut eleifend lacus. Proin lobortis vitae metus vel posuere.
          Integer finibus urna vitae nisi tincidunt, in posuere leo scelerisque.
          Aenean ac tortor id leo imperdiet condimentum eget eget ligula. Aenean
          suscipit vestibulum lacus, tempor faucibus ipsum. Morbi metus sem,
          ultrices ac lacus eu, ultrices pulvinar urna. Maecenas eget quam non
          lorem fermentum venenatis id eu tellus. In ultrices ut felis vel
          pellentesque. Phasellus porta nulla non ullamcorper consequat. Nunc id
          elit scelerisque, commodo sem eget, maximus metus. Nam non consequat
          ex.
        </p>
      </div>
    </ContainerLayout>
  );
};

export default AboutView;
