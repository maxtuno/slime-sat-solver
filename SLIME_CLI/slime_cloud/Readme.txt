SLIME CLOUD

usage (on cell):

mpirun -q -np 4 -hostfile hostfile --allow-run-as-root ./slime_cloud_competitive <cnf> [proof]

mpirun -q -np 4 -hostfile hostfile --allow-run-as-root ./slime_cloud_cooperative <cnf> [proof]

Note: 

	1 - This binary work only on Google Colab. (https://colab.research.google.com/)
	2 - Change number of process on slime_cloud.sh and hostfile

Like & Share!

Tip:

!unzip slime_cloud.zip
cd /content/slime_cloud
!chmod 777 slime_cloud
!sh slime_cloud.sh <cnf>