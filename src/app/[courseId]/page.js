import { db } from "../../utils/config";
import { doc, getDoc } from "firebase/firestore";

export default async function Page({ params }) {
	const data = await getData(params);
	return (
		<div>
			Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus
			excepturi in temporibus porro incidunt explicabo nesciunt delectus,
			veritatis vero neque animi aliquid fugiat quisquam sunt voluptatum non
			consequatur! Maxime nam iste atque? Veniam vitae enim quia, dicta quisquam
			saepe officiis aspernatur ipsam alias reprehenderit? Suscipit eaque,
			aliquam laudantium error fugiat quae, repudiandae blanditiis asperiores
			sequi labore facilis nostrum quia similique deserunt est quidem laboriosam
			assumenda at modi quo cum. Consectetur dolore dolores minima voluptatum
			rerum libero maiores expedita accusantium deserunt beatae dolorem, quas
			rem ullam quibusdam temporibus incidunt, vel molestiae doloribus animi
			tenetur modi dolor. Sequi reiciendis dolorum excepturi consectetur
			temporibus a expedita eveniet dolores tenetur, quia amet minus illum
			magnam cumque laboriosam repellendus esse eos vitae molestias quasi
			deserunt officiis omnis perspiciatis! Ab sequi, illum necessitatibus
			beatae, reprehenderit voluptatibus incidunt laudantium nihil nemo ex, quis
			temporibus. Enim tempore ullam rem veritatis. Alias et assumenda facere
			tempore fugiat cupiditate fuga expedita, illo laudantium temporibus
			delectus eos odio voluptates soluta odit ipsa praesentium cum voluptate,
			natus minima? Illo aliquam distinctio ex itaque neque consequuntur est
			earum pariatur cum quo, modi dolor? Odio blanditiis non hic nihil totam.
			Praesentium facere, dignissimos similique reprehenderit voluptatem dolor
			expedita libero culpa laborum modi! Et at officia quia pariatur
			necessitatibus eligendi odio error. Dolorem tempore ad ullam nostrum
			dolore quisquam quibusdam eos dolor, quae odio? Modi temporibus nostrum
			itaque, nulla velit perspiciatis aut illo deserunt nesciunt voluptas sequi
			reprehenderit delectus libero error amet at dolorum. Veniam nobis
			repellat, voluptatum iste, impedit optio illum possimus sequi rem ullam
			ipsam. Delectus culpa voluptate placeat eos dignissimos libero sint
			voluptates maiores alias sapiente? In animi at ea provident tempora
			dignissimos molestiae similique velit cumque aspernatur, alias omnis illum
			voluptates repudiandae officia qui et odio id quas debitis blanditiis quia
			earum? Ea nihil pariatur omnis porro modi laborum et, soluta voluptatem
			sapiente quis necessitatibus atque blanditiis illum temporibus iure
			voluptatum fugiat quas quae deleniti reiciendis nesciunt autem inventore.
			Temporibus nostrum fugiat assumenda excepturi nesciunt sapiente
			consectetur. Rerum possimus quaerat accusantium reprehenderit illo nihil
			atque consequatur magni vero ratione, iusto omnis facilis quos beatae
			laudantium pariatur esse ipsa exercitationem odit neque vitae, autem vel
			eius? Eum nemo obcaecati veniam vitae iure delectus sapiente aliquam
			voluptatum! Cupiditate, dolore. Officia, iure quisquam numquam ut rerum
			repudiandae enim beatae mollitia repellendus, explicabo maxime laborum.
			Amet sint totam eligendi delectus nulla at quo voluptas! Et corrupti
			dolore harum voluptates praesentium ullam hic, quo consectetur laboriosam
			unde, quibusdam, deleniti sunt quas ea ratione blanditiis consequatur
			earum exercitationem in iste? Labore, dolorem. Perspiciatis pariatur
			distinctio quas reprehenderit suscipit optio autem omnis. Corrupti maxime
			eligendi velit, eum ab eos totam impedit. Quas voluptatum consectetur
			consequuntur molestiae consequatur voluptas maiores dolorem a inventore
			rem. Dolorem qui ducimus debitis adipisci dignissimos error earum ut
			placeat tempora quaerat architecto illum, quidem exercitationem voluptas
			praesentium maiores alias fugiat possimus harum molestiae. Impedit animi,
			ratione quos ducimus vero non, quidem laborum, repellendus saepe adipisci
			harum enim? Non repellendus excepturi debitis tenetur neque rerum,
			voluptatum quaerat provident, quas iusto perferendis voluptatem illum vero
			aut!
		</div>
	);
}

async function getData(params) {
	let data = {};

	const document = await getDoc(doc(db, "courses", params.courseId));

	if (document.exists()) {
		data = document.data();
	} else {
		console.log("No such document!");
	}

	return data;
}
