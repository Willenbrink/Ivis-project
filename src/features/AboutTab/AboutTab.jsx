
import { useRef } from 'react'
import { BsEnvelope, BsLinkedin } from 'react-icons/bs'
import AboutImage from '../../assets/AboutImage'
import { teamMembersInfo } from '../../utils/teamMembersInfo'
function AboutTab() {
    return (
        <div className="d-flex flex-grow-1 flex-column align-items-center">
            <div className="w-75 d-flex flex-column pt-5">
                <div className='d-flex'>
                    <div className='col-8 pe-3'>
                        <p className="fs-3 mb-2 text-primary">The Moral Machine project</p>
                        <p>The Moral Machine data was collected between 2016 and 2018 through &nbsp;
                            <a href='https://www.moralmachine.net/'>https://www.moralmachine.net/</a>,
                            where participants got to decide what the autonomous car should do,
                            or  who to save in other words, in 13 different scenarios.
                        </p>
                        <p>The scenarios manipulated 9 different factors/attributes:</p>
                        <ul>
                            <li>Kind of intervention (stay/swerve)</li>
                            <li>Relationship to automated vehicle (pedestrians/passengers)</li>
                            <li>Legality (lawful/unlawful)</li>
                            <li>Gender (males/females)</li>
                            <li>Age (younger/older)</li>
                            <li>Social status (higher/lower)</li>
                            <li>Fitness (fit/large)</li>
                            <li>Number of characters (more/fewer)</li>
                            <li>Species (humans/pets)</li>
                        </ul>
                        <p>The results was presented in the following paper:</p>
                        <p>
                            Awad, E., Dsouza, S., Kim, R. et al. The Moral Machine experiment. Nature 563, 59–64 (2018).&nbsp; 
                            <a href='https://doi.org/10.1038/s41586-018-0637-6'>https://doi.org/10.1038/s41586-018-0637-6</a>
                        </p>
                    </div>
                    <div className='col-4 d-flex flex-column'>
                        <div className='d-flex flex-column pt-5'>
                        <AboutImage/>
                        <p className='small'>
                            <strong>Image 1:</strong> an example of a scenario which the participants might had to answer. 
                        The image is a redraw from the original images found at 
                        <a href='https://www.moralmachine.net/'> https://www.moralmachine.net/</a>.
                        </p>
                        </div>
                    </div>
                </div>
                <p className="fs-3 mb-2 text-primary">The data</p>
                        <p>The data was extracted from <a href='https://osf.io/3hvt2/?view_only='>https://osf.io/3hvt2/?view_only=</a>.</p>
                        <p>The data we use in the visualizations are the <i>Average Marginal Causal Effect</i> (AMCE) of each attribute. 
                        For example, "Gender (Male/Female)" represents the change in probability 
                        of saving the characters if we replace male characters with female characters 
                        (averaged over all other factors). To read more, go to <a href='https://osf.io/wt6mc'>https://osf.io/wt6mc</a>.
                        </p>
                        <p><strong className='text-danger'>Note:</strong> We deleted two countries' answers, the french departmens Réunion and Martinique, due to our
                            map data not separating these from France. These small Islands are still visible and always have the same colors as France, 
                            although their answers differs from France. We didn't fix this issue due to time constraints.
                        </p>
                        <p>
                          The code for the visualization can be found on <a href="https://github.com/Willenbrink/Ivis-project">https://github.com/Willenbrink/Ivis-project</a>.
                        </p>
                <p className="fs-3 text-primary mb-2">The team behind the visualizations</p>
                <div className="d-flex flex-wrap mb-5">
                    {teamMembersInfo.map(member => 
                        <TeamMemberCard 
                        key={member.name}
                        name={member.name} 
                        email={member.email}
                        learning={member.learning}
                        linkedin={member.linkedin}
                        work={member.work}
                        className='col-5 col-md-4 col-lg-3 col-xl-3 col-xxl-3'
                    />)}
                
                </div>
                
            </div>
        </div>
    )
}

function TeamMemberCard({name, email, linkedin, work, learning, className}){
    const linkedInRef = useRef()

    const linkedInButton = (
        <div className='' style={{ cursor: 'pointer'}} onClick={()=>linkedInRef.current.click()}>
             <BsLinkedin className='text-primary'/>
            <a ref={linkedInRef} href={linkedin} className='d-none'></a>
        </div>
    )
    return (
        <div className={`${className} m-2`}>
        <div className={`person-card h-100 w-100 p-3 d-flex flex-column gap-1`}>
            <p className="fs-5 m-0">{name}</p>
            <div className='d-flex gap-2 align-items-center'>
            <BsEnvelope size=''/>
            <p className='m-0'>{email}</p>
            </div>
            {linkedin && linkedInButton}
            <p className="fw-bold m-0">Work distribution:</p>
            <p>{work}</p>
            <p className="fw-bold m-0">Learning objectives:</p>
            <p>{learning}</p>

        </div>
        </div>
    )
}

export default AboutTab
